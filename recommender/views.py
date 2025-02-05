from django.shortcuts import render
from .utils import load_resumes, recommend_resumes

def home(request):
    resumes = load_resumes()
    if request.method == "POST":
        job_desc = request.POST.get("job_description", "")
        top_n = int(request.POST.get("top_n", 5))
        recommendations = recommend_resumes(job_desc, resumes, top_n)
        return render(request, "results.html", {"recommendations": recommendations, "job_desc": job_desc})
    return render(request, "home.html")