from django.shortcuts import render
from .forms import JobSearchForm
from .models import Resume
from .utils import recommend_resumes  # We'll create this next

def check_embeddings(request):
    resumes = Resume.objects.all()
    for resume in resumes:
        if resume.embedding:
            arr = np.frombuffer(resume.embedding, dtype=np.float32)
            print(f"{resume.name}: {arr.shape}")
    return HttpResponse("Check console for output")

def home(request):
    if request.method == 'POST':
        form = JobSearchForm(request.POST)
        if form.is_valid():
            job_desc = form.cleaned_data['job_description']
            top_n = int(form.cleaned_data.get('top_n', 5))  # Get top_n from form
            resumes = Resume.objects.all()
            recommendations = recommend_resumes(job_desc, resumes, top_n=top_n)
            return render(request, 'results.html', {'recommendations': recommendations})
    else:
        form = JobSearchForm()
    return render(request, 'home.html', {'form': form})