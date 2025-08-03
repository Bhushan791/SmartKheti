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
            # 🔧 FIXED: Pass request context
            serializer = CropListingReadSerializer(listing, context={'request': request})
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

            # 🔧 FIXED: Pass request context
            serializer = CropListingReadSerializer(queryset, many=True, context={'request': request})
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

        serializer = CropListingSerializer(listing, partial=True, data=request.data, context={'request': request})
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
        # 🔧 FIXED: Pass request context
        serializer = CropListingReadSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)






###News
import requests
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
from datetime import datetime, timedelta

@method_decorator(csrf_exempt, name='dispatch')
class NepalNewsAPIView(View):
    """
    Class-based view to fetch Nepal news from NewsAPI and return filtered results
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.API_KEY = "582f1543b02146c78969b480c237f94b"  # Move this to settings.py later
        self.search_queries = [
            # Nepal-specific searches
            'Nepal',
            'Nepal+news',
            'Nepal+politics',
            'Nepal+economy',
            'Nepal+development',
            'Kathmandu',
            'Nepal+government',
            'Nepal+society',
            'Nepal+culture',
            'Nepal+business',
            'Nepal+technology',
            'Nepal+education',
            'Nepal+health',
            'Nepal+tourism',
            'Nepal+environment',
            # Agriculture specific to Nepal
            'Nepal+agriculture',
            'Nepal+farming',
            'Nepal+rice+farming',
            'Nepal+wheat+production',
            'Nepal+farmers',
        ]
        
        self.nepal_keywords = [
            'nepal', 'nepali', 'nepalese', 'kathmandu', 'pokhara', 'lalitpur', 'bhaktapur',
            'himalaya', 'everest', 'sagarmatha', 'koshi', 'gandaki', 'lumbini',
            'oli', 'prachanda', 'deuba', 'bhandari', 'parliament', 'constituent assembly',
            'communist party', 'congress', 'uml', 'maoist',
            'agriculture', 'farming', 'farmer', 'rice', 'wheat', 'maize', 'vegetable', 'fruit',
            'rupee', 'economy', 'development', 'infrastructure', 'trade', 'export', 'import',
            'remittance', 'tourism', 'hydropower', 'electricity'
        ]

    def get(self, request, *args, **kwargs):
        """
        Handle GET requests to fetch Nepal news
        """
        try:
            all_articles = self.fetch_all_articles()
            
            if not all_articles:
                return JsonResponse({
                    "status": "error",
                    "message": "No Nepal news found. Please try again later.",
                    "articles": []
                })
            
            # Process and filter articles
            filtered_news = self.process_articles(all_articles)
            
            return JsonResponse({
                "status": "success",
                "articles": filtered_news,
                "total": len(filtered_news),
                "message": f"Found {len(filtered_news)} Nepal news articles"
            })
            
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": f"Failed to fetch news: {str(e)}",
                "articles": []
            })

    def fetch_all_articles(self):
        """
        Fetch articles from multiple sources and queries
        """
        all_articles = []
        
        # Try NewsAPI with country parameter for Nepal (np)
        all_articles.extend(self.fetch_country_headlines())
        
        # Try each search query with everything endpoint
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()
        
        for query in self.search_queries[:5]:  # Limit to first 5 queries to avoid rate limits
            articles = self.fetch_query_articles(query, week_ago)
            all_articles.extend(articles)
        
        return all_articles

    def fetch_country_headlines(self):
        """
        Fetch headlines specifically for Nepal country
        """
        try:
            country_url = f"https://newsapi.org/v2/top-headlines?country=np&pageSize=20&apiKey={self.API_KEY}"
            country_response = requests.get(country_url, timeout=10)
            country_data = country_response.json()
            
            if country_data.get("status") == "ok" and country_data.get("articles"):
                return country_data["articles"]
        except Exception as e:
            print(f"Failed to fetch Nepal country headlines: {e}")
        
        return []

    def fetch_query_articles(self, query, from_date):
        """
        Fetch articles for a specific search query
        """
        try:
            url = f"https://newsapi.org/v2/everything?q={query}&sortBy=publishedAt&pageSize=10&from={from_date}&apiKey={self.API_KEY}"
            response = requests.get(url, timeout=10)
            query_data = response.json()
            
            if query_data.get("status") == "error":
                print(f"API error for query {query}: {query_data.get('message')}")
                return []
            
            if query_data.get("articles"):
                return query_data["articles"]
        except Exception as e:
            print(f"Failed to fetch for query: {query} - {e}")
        
        return []

    def process_articles(self, all_articles):
        """
        Remove duplicates and filter for Nepal-related content
        """
        # Remove duplicates
        unique_articles = self.remove_duplicates(all_articles)
        
        # Filter for Nepal-related content
        filtered_news = self.filter_nepal_content(unique_articles)
        
        # Sort by published date and limit results
        filtered_news.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
        return filtered_news[:25]

    def remove_duplicates(self, articles):
        """
        Remove duplicate articles based on title
        """
        unique_articles = []
        seen_titles = set()
        
        for article in articles:
            if article.get("title") and article["title"] not in seen_titles:
                seen_titles.add(article["title"])
                unique_articles.append(article)
        
        return unique_articles

    def filter_nepal_content(self, articles):
        """
        Filter articles to only include Nepal-related content
        """
        filtered_news = []
        
        for article in articles:
            if not article.get("title") or not article.get("description"):
                continue
                
            title = article["title"].lower()
            description = article["description"].lower()
            content = (article.get("content") or "").lower()
            
            # Remove removed content
            if "[removed]" in title or "[removed]" in description:
                continue
            
            # Check for Nepal-related content
            has_nepal_content = any(
                keyword in title or keyword in description or keyword in content
                for keyword in self.nepal_keywords
            )
            
            if has_nepal_content:
                filtered_news.append(article)
        
        return filtered_news

    def post(self, request, *args, **kwargs):
        """
        Handle POST requests (not allowed for this endpoint)
        """
        return JsonResponse({
            "status": "error",
            "message": "POST method not allowed for this endpoint"
        }, status=405)

    def put(self, request, *args, **kwargs):
        """
        Handle PUT requests (not allowed for this endpoint)
        """
        return JsonResponse({
            "status": "error",
            "message": "PUT method not allowed for this endpoint"
        }, status=405)

    def delete(self, request, *args, **kwargs):
        """
        Handle DELETE requests (not allowed for this endpoint)
        """
        return JsonResponse({
            "status": "error",
            "message": "DELETE method not allowed for this endpoint"
        }, status=405)