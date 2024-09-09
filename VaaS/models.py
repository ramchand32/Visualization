from django.db import models

# Create your models here.
class VisualModel(models.Model):
    ReportId = models.AutoField(primary_key=True)
    ReportType = models.CharField(max_length=500)
    RequestName = models.CharField(max_length=500)
    RequestedBy = models.CharField(max_length=500,default="")
    CreatedAt = models.DateTimeField(auto_now_add=True)
    UpdatedAt = models.DateTimeField(auto_now=True)
    State = models.IntegerField(default=0)
    ActualConfig = models.CharField(max_length=500)
    UniqueConfig = models.CharField(max_length=1000,default="")
    VisualizationReport = models.CharField(max_length=500,default="")
    SharedWith = models.TextField(default="")
    Instance = models.CharField(max_length=30,default="gstoolspvn")
    Options = models.CharField(max_length=1000, default = "{}")