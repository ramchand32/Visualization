from rest_framework import serializers
from VaaS.models import VisualModel

class VisualModelSerializer(serializers.ModelSerializer):
    Options = serializers.JSONField()
    class Meta:
        model = VisualModel
        fields = '__all__'