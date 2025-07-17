from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import CropListing
from .serializers import CropListingSerializer, CropListingReadSerializer

class CropListingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None):
        if pk:
            listing = get_object_or_404(CropListing, pk=pk)
            serializer = CropListingReadSerializer(listing)
            return Response(serializer.data)
        else:
            searchquery = request.query_params.get('searchquery')

            queryset = CropListing.objects.all().order_by('-date_posted')
            if searchquery:
                queryset = queryset.filter(
                    Q(crop_name__icontains=searchquery) |
                    Q(location__icontains=searchquery) |
                    Q(description__icontains=searchquery)
                )

            serializer = CropListingReadSerializer(queryset, many=True)
            return Response(serializer.data)


    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required to create listings."},
                            status=status.HTTP_401_UNAUTHORIZED)

        serializer = CropListingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required to update listings."},
                            status=status.HTTP_401_UNAUTHORIZED)

        listing = get_object_or_404(CropListing, pk=pk)
        if listing.farmer != request.user:
            raise PermissionDenied("You can only update your own listings.")

        serializer = CropListingSerializer(listing, partial = True, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required to delete listings."},
                            status=status.HTTP_401_UNAUTHORIZED)

        listing = get_object_or_404(CropListing, pk=pk)
        if listing.farmer != request.user:
            raise PermissionDenied("You can only delete your own listings.")

        listing.delete()
        return Response({"detail": "Listing deleted."}, status=status.HTTP_204_NO_CONTENT)


class MyListingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        listings = CropListing.objects.filter(farmer=request.user).order_by('-date_posted')
        serializer = CropListingReadSerializer(listings, many=True)
        return Response(serializer.data)
