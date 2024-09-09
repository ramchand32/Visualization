import os
import uuid

from pathlib import WindowsPath
from pickletools import anyobject
from tkinter import ALL

from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse
from django.http import FileResponse, Http404
from django.core.files.storage import default_storage
from django.core.exceptions import PermissionDenied

from gstoolspvnapi.settings.dev import ALLOWED_HOSTS, BASE_DIR, DOWNLOAD_ROOT, DOWNLOAD_URL, MEDIA_ROOT
from rest_framework.parsers import JSONParser

from VaaS.models import VisualModel
from VaaS.serializers import VisualModelSerializer
from VaaS.NRVUtils import NRVUtils


# Create your views here.
@csrf_exempt
def visualreportApi(request,id=0):
    checkreferer(request)
    if request.method=='GET':
        if id!= 0:
            report = VisualModel.objects.get(ReportId=id)
            report_serializer=VisualModelSerializer(report,many=False)
            return JsonResponse(report_serializer.data,safe=False)
        else:
            reports = VisualModel.objects.all()
            report_serializer=VisualModelSerializer(reports,many=True)
            return JsonResponse(report_serializer.data,safe=False)
    elif request.method=='POST':
        report_data= JSONParser().parse(request)
        report_serializer=VisualModelSerializer(data=report_data)
        if report_serializer.is_valid():
            report_serializer.save()
            return JsonResponse("Added Successfully", safe=False)
        return JsonResponse("Failed to Update",safe=False)
    elif request.method=='PUT':
        report_data=JSONParser().parse(request)
        report=VisualModel.objects.get(ReportId=report_data['ReportId'])
        report_serializer=VisualModelSerializer(instance=report,data=report_data, partial=True)
        if report_serializer.is_valid():
            report_serializer.save()
            return JsonResponse("Update Successfully",safe=False)
        return JsonResponse("Failed to Update",safe=False)
    elif request.method=='DELETE':
        report=VisualModel.objects.get(ReportId=id)
        report.delete()
        return JsonResponse("Deleted Successfully",safe=False)

@csrf_exempt
def getuserrecords(request,email):
    checkreferer(request)
    if request.method=='GET':
         reportObjects = VisualModel.objects.filter(RequestedBy=email)
         data = list(reportObjects.values())
         return JsonResponse(data,safe=False)

@csrf_exempt
def getrecords(request,state=0):
    checkreferer(request)
    if request.method=='GET':
        reportObjects = VisualModel.objects.filter(State=state)
        data = list(reportObjects.values())
        return JsonResponse(data,safe=False)

@csrf_exempt
def savefile(request):
    checkreferer(request)
    file = request.FILES['file']
    uniq_name = "%s_%s" % ((uuid.uuid4()), file.name.replace(" ",""))
    file_name = default_storage.save(uniq_name, file)
    return JsonResponse(file_name, safe=False)

@csrf_exempt
def extractData(request):
    if request.method=='POST':
        file = request.FILES['file']
        config = request.POST.get('config')
        uniq_name = "%s_%s" % ((uuid.uuid4()), file.name.replace(" ",""))
        file_name = default_storage.save(uniq_name, file)
        data = NRVUtils().extractData(file_name, config)
        return JsonResponse(data, safe=False)

@csrf_exempt
def downloadfile(request, fmt, id):
    checkreferer(request)
    if fmt=='error':
        fmt='txt'
    report=VisualModel.objects.get(ReportId=id)   
    filename =  report.VisualizationReport
    filepath = (str(DOWNLOAD_ROOT)+"\\"+filename + "."+str(fmt))
    if os.path.exists(filepath):
        response = FileResponse(open(filepath, 'rb'))
        return response
    raise Http404

@csrf_exempt
def downloadStylesheet(request):
    checkreferer(request)
    filename =  "NRVReport.xsl"
    filepath = str(DOWNLOAD_ROOT)+"\\"+filename
    if os.path.exists(filepath):
        response = FileResponse(open(filepath, 'rb'))
        return response
    raise Http404

@csrf_exempt
def getrecordsbyinstance(request,instance):
    checkreferer(request)
    if request.method=='GET':
        # print(instance)
        reportObjects = VisualModel.objects.filter(Instance=instance)
        data = list(reportObjects.values())
        return JsonResponse(data,safe=False)

@csrf_exempt
def getuserrecordsbyinstance(request,instance,email):
    checkreferer(request)
    if request.method=='GET':
        # print(instance)
        reportObjects = VisualModel.objects.filter(Instance=instance).filter(RequestedBy__icontains=email)
        # reportObjects = reportObjects.filter(RequestedBy=email)
        data = list(reportObjects.values())
        return JsonResponse(data,safe=False)

@csrf_exempt
def getemails(request,instance):
    checkreferer(request)
    if request.method=='GET':
        reportObjects = VisualModel.objects.filter(Instance=instance)
        data = list(reportObjects.values('RequestedBy').distinct())
        return JsonResponse(data,safe=False)
        
def checkreferer(request):
    key = 'Referer'
    url = os.environ['HOST_VALIDITY']
    # 'https://ascidev4.dr.avaya.com/'
    if key in request.headers.keys():
        # print(request.headers.get(key))
        val = request.headers.get(key)
        if (val.startswith(url)):
            return True 
    else:
        ip = getipaddress(request)
        if ip in ALLOWED_HOSTS:
            return True 
        print('Not present')
    raise PermissionDenied

def getipaddress(request):
    req_headers = request.META
    x_forwarded_for_value = req_headers.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for_value:
        ip_addr = x_forwarded_for_value.split(',')[-1].strip()
    else:
        ip_addr = req_headers.get('REMOTE_ADDR')
    return ip_addr