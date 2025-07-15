import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import ImageUploadSerializer
from .models import DiseaseInfo, Product, DetectionRecord
from .serializers import DetectionRecordSerializer
from rest_framework.generics import ListAPIView

from rest_framework.permissions import IsAdminUser
import numpy as np
from PIL import Image
import tflite_runtime.interpreter as tflite 

MODEL_PATH = os.path.join(settings.BASE_DIR, 'disease_detection', 'AI_Model', 'model_unquant.tflite')
LABELS_PATH = os.path.join(settings.BASE_DIR, 'disease_detection', 'AI_Model', 'labels.txt')

with open(LABELS_PATH, 'r') as f:
    labels = [line.strip() for line in f.readlines()]

interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

def preprocess_image(image, target_size=(224, 224)):
    image = image.convert('RGB')
    image = image.resize(target_size)
    image_array = np.array(image).astype(np.float32)
    # Normalize (if your model expects)
    image_array = image_array / 255.0
    # Add batch dim
    return np.expand_dims(image_array, axis=0)

class DiseaseDetectionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        serializer = ImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            image = serializer.validated_data['image']
            pil_image = Image.open(image)

            input_data = preprocess_image(pil_image, target_size=(input_details[0]['shape'][2], input_details[0]['shape'][1]))

            interpreter.set_tensor(input_details[0]['index'], input_data)
            interpreter.invoke()
            output_data = interpreter.get_tensor(output_details[0]['index'])[0]

            pred_index = np.argmax(output_data)
            pred_label = labels[pred_index]

            # Save detection record
            DetectionRecord.objects.create(
                user=request.user,
                image=image,
                detected_disease=pred_label,
            )

            # Split label to get crop and disease
            parts = pred_label.split('_', 1)
            crop = parts[0]
            disease_name = parts[1] if len(parts) > 1 else pred_label

            try:
                disease_info = DiseaseInfo.objects.get(name__iexact=disease_name, crop__iexact=crop)

                if disease_info.is_healthy:
                    # If healthy, just return a simple positive message
                    response_data = {
                        "detected_disease": "Healthy",
                        "crop": disease_info.crop,
                        "message": "Your crop looks healthy! Keep monitoring regularly.",
                        "recheck_advice": disease_info.recheck_advice
                    }
                else:
                    # If disease, return full info with products etc.
                    products = disease_info.products.all()
                    products_data = [{"name": p.name, "image": request.build_absolute_uri(p.image.url)} for p in products]

                    response_data = {
                        "detected_disease": disease_info.name,
                        "crop": disease_info.crop,
                        "short_remedy": disease_info.short_remedy,
                        "treatment": disease_info.treatment,
                        "recheck_advice": disease_info.recheck_advice,
                        "products": products_data
                    }

            except DiseaseInfo.DoesNotExist:
                response_data = {
                    "detected_disease": pred_label,
                    "crop": crop,
                    "message": "No detailed info found for this disease."
                }

            return Response(response_data)
        else:
            return Response(serializer.errors, status=400)



class DetectionHistoryAPIView(ListAPIView):
    permission_classes= [IsAuthenticated]
    serializer_class= DetectionRecordSerializer

    def get_queryset(self):
        return DetectionRecord.objects.filter(user= self.request.user).order_by('-detected_at')
    



class AdminDetectionListAPIView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = DetectionRecordSerializer
    queryset = DetectionRecord.objects.all().order_by('-detected_at')
    