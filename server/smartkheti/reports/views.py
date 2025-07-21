from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.http import HttpResponse
from datetime import datetime
import logging
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from io import BytesIO

from disease_detection.models import DetectionRecord
from .serializers import DiseaseReportRequestSerializer

logger = logging.getLogger(__name__)

class DiseaseTrendReportView(APIView):
    authentication_classes = []
    permission_classes = []
    
    def get(self, request):
        try:
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')
            
            queryset = DetectionRecord.objects.select_related('user').exclude(
                detected_disease__icontains='healthy'
            ).all()
            
            # Filter by date if both parameters provided
            date_range_text = "All Records"
            if start_date_str and end_date_str:
                serializer = DiseaseReportRequestSerializer(data={
                    'start_date': start_date_str,
                    'end_date': end_date_str
                })
                
                if not serializer.is_valid():
                    return Response(
                        {"error": "Invalid date parameters", "details": serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                start_date = serializer.validated_data['start_date']
                end_date = serializer.validated_data['end_date']
                
                # Create timezone-aware datetime objects
                start_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
                end_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
                
                queryset = queryset.filter(
                    detected_at__gte=start_datetime,
                    detected_at__lte=end_datetime
                )
                
                date_range_text = f"From {start_date_str} to {end_date_str}"
                
            elif start_date_str or end_date_str:
                return Response(
                    {"error": "Both start_date and end_date are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            queryset = queryset.order_by('-detected_at')
            
            # Build report data
            report_data = []
            for detection in queryset:
                location = detection.user.district if (detection.user and detection.user.district) else "Unknown"
                
                report_data.append({
                    "disease_name": detection.detected_disease,
                    "detected_at": detection.detected_at.strftime('%Y-%m-%d %H:%M:%S') if detection.detected_at else None,
                    "location": location
                })
            
            # Generate PDF
            pdf_response = self.generate_pdf(report_data, date_range_text)
            return pdf_response
            
        except Exception as e:
            logger.error(f"Error in DiseaseTrendReportView: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def generate_pdf(self, data, date_range_text):
        """Generate PDF from the report data"""
        try:
            # Create a BytesIO buffer to hold PDF data
            buffer = BytesIO()
            
            # Create PDF document with custom page template
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=50,
                leftMargin=50,
                topMargin=80,  # More space for header
                bottomMargin=50
            )
            
            # Container for the 'Flowable' objects
            elements = []
            
            # Get styles
            styles = getSampleStyleSheet()
            
            # SmartKheti Brand Header Style
            brand_header_style = ParagraphStyle(
                'BrandHeader',
                parent=styles['Heading1'],
                fontSize=28,
                spaceAfter=5,
                alignment=1,  # Center alignment
                textColor=colors.darkgreen,
                fontName='Helvetica-Bold'
            )
            
            brand_tagline_style = ParagraphStyle(
                'BrandTagline',
                parent=styles['Normal'],
                fontSize=12,
                spaceAfter=25,
                alignment=1,
                textColor=colors.darkslategray,
                fontName='Helvetica-Oblique'
            )
            
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=20,
                spaceAfter=20,
                alignment=1,  # Center alignment
                textColor=colors.darkred,
                fontName='Helvetica-Bold'
            )
            
            subtitle_style = ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Normal'],
                fontSize=12,
                spaceAfter=15,
                alignment=1,  # Center alignment
                textColor=colors.darkslategray
            )
            
            section_header_style = ParagraphStyle(
                'SectionHeader',
                parent=styles['Heading2'],
                fontSize=16,
                spaceAfter=15,
                spaceBefore=25,
                textColor=colors.darkgreen,
                fontName='Helvetica-Bold'
            )
            
            summary_point_style = ParagraphStyle(
                'SummaryPoint',
                parent=styles['Normal'],
                fontSize=11,
                spaceAfter=8,
                leftIndent=20,
                textColor=colors.black
            )
            
            # Add SmartKheti Brand Header
            brand_header = Paragraph("🌱 SmartKheti 🌱", brand_header_style)
            elements.append(brand_header)
            
            # Add brand tagline
            tagline = Paragraph("Smart Agriculture • Disease Detection System", brand_tagline_style)
            elements.append(tagline)
            
            # Add separator line
            separator_style = ParagraphStyle(
                'Separator',
                parent=styles['Normal'],
                alignment=1,
                spaceAfter=20
            )
            separator = Paragraph("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", separator_style)
            elements.append(separator)
            
            # Add main title
            elements.append(Paragraph("🌾 CROP DISEASE DETECTION REPORT 🌾", title_style))
            
            # Add date range with better styling
            subtitle = Paragraph(f"📅 Report Period: <b>{date_range_text}</b>", subtitle_style)
            elements.append(subtitle)
            
            # Add generation timestamp
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            timestamp_para = Paragraph(f"⏰ Generated on: {timestamp}", subtitle_style)
            elements.append(timestamp_para)
            
            # Add decorative spacer
            elements.append(Spacer(1, 20))
            
            if data:
                # Add detection records section
                section_title = Paragraph("📋 Detection Records", section_header_style)
                elements.append(section_title)
                
                # Create table data
                table_data = [['🦠 Disease Name', '📅 Detection Date', '📍 Location']]  # Header
                
                for item in data:
                    table_data.append([
                        item['disease_name'].replace('_', ' '),
                        item['detected_at'],
                        item['location']
                    ])
                
                # Create table with better proportions
                table = Table(table_data, colWidths=[2.8*inch, 2.2*inch, 1.8*inch])
                
                # Enhanced table styling
                table.setStyle(TableStyle([
                    # Header styling
                    ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 11),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    
                    # Data rows styling
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 9),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                    
                    # Alternating row colors
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.lightblue, colors.lightyellow]),
                    
                    # Add padding
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ]))
                
                elements.append(table)
                
                # Generate intelligent summary
                summary_points = self.generate_summary_analysis(data)
                
                if summary_points:
                    elements.append(Spacer(1, 25))
                    summary_title = Paragraph("📊 DISEASE TREND ANALYSIS & INSIGHTS", section_header_style)
                    elements.append(summary_title)
                    
                    for i, point in enumerate(summary_points, 1):
                        bullet_point = Paragraph(f"• <b>Key Insight {i}:</b> {point}", summary_point_style)
                        elements.append(bullet_point)
                
                # Add total summary with better styling
                elements.append(Spacer(1, 20))
                total_style = ParagraphStyle(
                    'TotalStyle',
                    parent=styles['Normal'],
                    fontSize=12,
                    alignment=1,
                    textColor=colors.darkred,
                    fontName='Helvetica-Bold'
                )
                summary_text = f"📈 Total Disease Detections: {len(data)} cases"
                summary = Paragraph(summary_text, total_style)
                elements.append(summary)
                
            else:
                # No data message with better styling
                no_data_style = ParagraphStyle(
                    'NoDataStyle',
                    parent=styles['Normal'],
                    fontSize=14,
                    alignment=1,
                    textColor=colors.grey
                )
                no_data = Paragraph("📭 No disease detection records found for the specified criteria.", no_data_style)
                elements.append(no_data)
            
            # Add footer with SmartKheti branding
            elements.append(Spacer(1, 30))
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=10,
                alignment=1,
                textColor=colors.darkgreen,
                fontName='Helvetica-Bold'
            )
            footer_text = "Generated by SmartKheti Disease Detection System | Powered by AI Agriculture Technology"
            footer = Paragraph(footer_text, footer_style)
            elements.append(footer)
            
            # Build PDF with watermark
            doc.build(elements, onFirstPage=self.add_watermark, onLaterPages=self.add_watermark)
            
            # Get PDF data from buffer
            pdf_data = buffer.getvalue()
            buffer.close()
            
            # Create HTTP response
            response = HttpResponse(pdf_data, content_type='application/pdf')
            filename = f'smartkheti_disease_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            response['Content-Length'] = len(pdf_data)
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            return Response(
                {"error": "Failed to generate PDF report"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def add_watermark(self, canvas, doc):
        """Add SmartKheti watermark to PDF pages"""
        canvas.saveState()
        
        # Add subtle background watermark
        canvas.setFillColor(colors.lightgrey, alpha=0.1)
        canvas.setFont("Helvetica-Bold", 60)
        canvas.rotate(45)
        canvas.drawCentredString(300, 0, "SmartKheti")

        
        # Add header watermark (top of page)
        canvas.restoreState()
        canvas.saveState()
        canvas.setFillColor(colors.darkgreen, alpha=0.8)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.drawString(50, A4[1] - 30, "SmartKheti Disease Detection System")
        canvas.drawRightString(A4[0] - 50, A4[1] - 30, f"Generated: {datetime.now().strftime('%Y-%m-%d')}")
        
        # Add bottom border
        canvas.setStrokeColor(colors.darkgreen)
        canvas.setLineWidth(2)
        canvas.line(50, 30, A4[0] - 50, 30)
        
        canvas.restoreState()
    
    def generate_summary_analysis(self, data):
        """Generate intelligent summary analysis from detection data"""
        if not data:
            return []
        
        from collections import Counter, defaultdict
        
        # Analyze data
        diseases = [item['disease_name'] for item in data]
        locations = [item['location'] for item in data]
        
        disease_counts = Counter(diseases)
        location_counts = Counter(locations)
        
        # Group by crop type and disease
        crop_disease_map = defaultdict(list)
        for disease in diseases:
            if 'Potato' in disease:
                crop_disease_map['Potato'].append(disease)
            elif 'Maize' in disease or 'Corn' in disease:
                crop_disease_map['Maize'].append(disease)
            elif 'Rice' in disease:
                crop_disease_map['Rice'].append(disease)
            elif 'Tomato' in disease:
                crop_disease_map['Tomato'].append(disease)
            elif 'Wheat' in disease:
                crop_disease_map['Wheat'].append(disease)
            else:
                crop_disease_map['Other Crops'].append(disease)
        
        summary_points = []
        
        # Most frequent disease
        if disease_counts:
            top_disease = disease_counts.most_common(1)[0]
            disease_name = top_disease[0].replace('_', ' ')
            count = top_disease[1]
            percentage = round((count / len(data)) * 100, 1)
            summary_points.append(f"{disease_name} is the most detected disease with {count} cases ({percentage}% of all detections)")
        
        # Most affected location
        if location_counts:
            top_location = location_counts.most_common(1)[0]
            location_name = top_location[0]
            count = top_location[1]
            percentage = round((count / len(data)) * 100, 1)
            summary_points.append(f"{location_name} region shows highest disease activity with {count} detections ({percentage}% of total cases)")
        
        # Crop-specific analysis
        for crop, crop_diseases in crop_disease_map.items():
            if len(crop_diseases) >= 2:  # Only if significant data
                crop_disease_counts = Counter(crop_diseases)
                top_crop_disease = crop_disease_counts.most_common(1)[0]
                disease_clean = top_crop_disease[0].replace('_', ' ')
                summary_points.append(f"{crop} crops are primarily affected by {disease_clean} with {top_crop_disease[1]} reported cases")
        
        # Location-disease correlation
        location_disease_map = defaultdict(list)
        for item in data:
            location_disease_map[item['location']].append(item['disease_name'])
        
        for location, loc_diseases in location_disease_map.items():
            if len(loc_diseases) >= 3:  # Only for locations with significant activity
                loc_disease_counts = Counter(loc_diseases)
                top_loc_disease = loc_disease_counts.most_common(1)[0]
                disease_clean = top_loc_disease[0].replace('_', ' ')
                summary_points.append(f"{disease_clean} is spreading rapidly in {location} area with {top_loc_disease[1]} confirmed cases")
        
        # Risk assessment
        if len(disease_counts) == 1:
            summary_points.append(f"Single disease outbreak detected - focused intervention recommended for {list(disease_counts.keys())[0].replace('_', ' ')}")
        elif len(disease_counts) >= 4:
            summary_points.append(f"Multiple disease types detected ({len(disease_counts)} different diseases) - comprehensive monitoring strategy needed")
        
        # Recent activity pattern (if we have timestamp data)
        recent_locations = set()
        for item in data[:3]:  # Last 3 detections
            recent_locations.add(item['location'])
        
        if len(recent_locations) == 1:
            recent_loc = list(recent_locations)[0]
            summary_points.append(f"Recent disease activity concentrated in {recent_loc} - immediate attention and containment measures recommended")
        
        # Return max 6 points as requested
        return summary_points[:6]