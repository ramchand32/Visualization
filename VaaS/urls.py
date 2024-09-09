from django.urls import include, re_path
from VaaS import views

from django.conf.urls.static import static
from django.conf import settings

urlpatterns=[

    re_path(r'^report$',views.visualreportApi,name='index'),
    re_path(r'^report/([0-9]+)$',views.visualreportApi),
    
    re_path(r'^report0',views.getrecords),
    re_path(r'^report/savefile',views.savefile),
    re_path(r'^report/extractdata',views.extractData),
    re_path(r'^report/stylesheet',views.downloadStylesheet),
    re_path(r'^report/([a-zA-Z]+)/([0-9]+)$',views.downloadfile),

    re_path(r'^report/users/(?P<instance>\w+)',views.getemails),
    re_path(r'^report/(?P<instance>\w+)/(?P<email>\w+|[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4})',views.getuserrecordsbyinstance),
    # re_path(r'^report/user/(?P<email>\w+|[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4})/$',views.getuserrecords),
    # re_path(r'^report/(?P<instance>\w+)',views.getrecordsbyinstance),
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)