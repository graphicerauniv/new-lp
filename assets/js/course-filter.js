// course-filter.js

class CourseFilter {

constructor(options = {}) {

this.pageType = options.pageType || "general"
this.department = options.department || null
this.coursePrefix = options.coursePrefix || null

this.coursesData = []
this.filteredCourses = []
this.swiper = null

this.init()

}

async init(){

await this.loadCourses()

this.setupUI()

this.attachEventListeners()

this.filterCourses()

window.addEventListener("resize",()=>{
this.filterCourses()
})

}

async loadCourses(){

try{

const response = await fetch("/lp/assets/etc/courses.json")

const data = await response.json()

this.coursesData = data

}catch(error){

console.error("Courses load error",error)

}

}

setupUI(){

const container = document.getElementById("courseFilterContainer")

if(!container) return

let html = `

<div class="max-w-7xl mx-auto px-4 md:px-6">

<div class="grid grid-cols-1 md:grid-cols-7 gap-4">

`

if(this.pageType === "general"){

html += `

<div class="md:col-span-3">

<select id="levelFilter"
class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">

<option value="">Select Level</option>
<option value="UG">Undergraduate</option>
<option value="PG">Postgraduate</option>
<option value="Diploma">Diploma</option>
<option value="PhD">PhD</option>

</select>

</div>


<div class="md:col-span-3">

<select id="departmentFilter"
class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">

<option value="">Select Department</option>
<option value="Computer Science Engineering">Computer Science Engineering</option>
<option value="Civil Engineering">Civil Engineering</option>
<option value="Mechanical Engineering">Mechanical Engineering</option>
<option value="Electrical Engineering">Electrical Engineering</option>
<option value="Biotechnology">Biotechnology</option>

</select>

</div>


<div class="md:col-span-1">

<button id="clearFilters"
class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-yellow-500 text-white rounded-xl">

Clear

</button>

</div>

`

}

html += `</div></div>`

html += `

<div class="max-w-7xl mx-auto px-4 md:px-6 mt-10">

<div class="swiper courseSwiper">

<div class="swiper-wrapper" id="courseResults"></div>

</div>

<div id="noResults" class="hidden text-center py-10">

<p class="text-gray-500 text-lg">No courses found</p>

</div>

</div>

<style>

.course-card{

background:white;
border-radius:18px;
padding:32px;
box-shadow:0 4px 20px rgba(0,0,0,0.06);
transition:.3s;

}

.course-title{

font-size:26px;
font-weight:700;
color:#1d4ed8;
margin-bottom:10px;

}

.course-meta{

color:#6b7280;
margin-bottom:18px;
font-size:15px;

}

.course-bullets{

margin-bottom:18px;
padding-left:20px;

}

.course-bullets li{

margin-bottom:8px;
color:#374151;
font-size:15px;

}

.course-desc{

color:#4b5563;
margin-bottom:18px;

}

.read-more{

color:#2563eb;
font-weight:600;
font-size:15px;
cursor:pointer;

}

.apply-btn{

background:linear-gradient(to right,#2563eb,#f59e0b);
color:white;
padding:12px 18px;
border-radius:8px;
font-weight:600;
border:none;
cursor:pointer;

}

.swiper-slide{

display:grid;
grid-template-columns:repeat(3,1fr);
gap:28px;

}

@media(max-width:1024px){

.swiper-slide{
grid-template-columns:repeat(2,1fr)
}

}

@media(max-width:768px){

.swiper-slide{
grid-template-columns:1fr
}

.course-card{
padding:22px
}

.course-title{
font-size:22px
}

}

.hidden{
display:none
}

</style>

`

container.innerHTML = html

}

attachEventListeners(){

const levelFilter = document.getElementById("levelFilter")
const departmentFilter = document.getElementById("departmentFilter")
const clearBtn = document.getElementById("clearFilters")

if(levelFilter){

levelFilter.addEventListener("change",()=>this.filterCourses())

}

if(departmentFilter){

departmentFilter.addEventListener("change",()=>this.filterCourses())

}

if(clearBtn){

clearBtn.addEventListener("click",()=>this.clearFilters())

}

}

filterCourses(){

const levelFilter = document.getElementById("levelFilter")?.value || ""
const departmentFilter = document.getElementById("departmentFilter")?.value || ""

this.filteredCourses = this.coursesData.filter(course=>{

const matchesLevel = !levelFilter || course.level === levelFilter

let matchesDepartment = true

if(this.pageType === "general" && departmentFilter){

matchesDepartment = course.department === departmentFilter

}

if(this.pageType === "department" && this.department){

matchesDepartment = course.department === this.department

}

return matchesLevel && matchesDepartment

})

this.renderCourses()

}

renderCourses(){

const results = document.getElementById("courseResults")
const noResults = document.getElementById("noResults")

if(!results) return

if(this.filteredCourses.length === 0){

results.innerHTML=""

noResults.classList.remove("hidden")

return

}

noResults.classList.add("hidden")


let cardsPerSlide

if(window.innerWidth < 640){

cardsPerSlide = 1

}else if(window.innerWidth < 1024){

cardsPerSlide = 4

}else{

cardsPerSlide = 6

}

const slides=[]

for(let i=0;i<this.filteredCourses.length;i+=cardsPerSlide){

slides.push(this.filteredCourses.slice(i,i+cardsPerSlide))

}

results.innerHTML = slides.map(slide=>{

const cards = slide.map((course,index)=>{

return `

<div class="course-card">

<h3 class="course-title">

${course.title}

</h3>

<p class="course-meta">

${course.department} • ${course.level} • ${course.duration}

</p>

<ul class="course-bullets">

${course.bullets.slice(0,3).map(b=>`<li>${b}</li>`).join("")}

</ul>

<div class="extra hidden">

<p class="course-desc">

${course.description}

</p>

<button class="apply-btn"
onclick="selectCourse('${course.title}','${course.department}')">

Apply Now

</button>

</div>

<p class="read-more"
onclick="toggleCard(this)">

Read More ▼

</p>

</div>

`

}).join("")

return `<div class="swiper-slide">${cards}</div>`

}).join("")

this.initSwiper()

}

initSwiper(){

if(this.swiper){

this.swiper.destroy(true,true)

}

setTimeout(()=>{

this.swiper = new Swiper(".courseSwiper",{

slidesPerView:1,
spaceBetween:20,
loop:true,

autoplay:{
delay:5000,
disableOnInteraction:true
},

})

},100)

}

clearFilters(){

const levelFilter = document.getElementById("levelFilter")
const departmentFilter = document.getElementById("departmentFilter")

if(levelFilter) levelFilter.value=""
if(departmentFilter) departmentFilter.value=""

this.filterCourses()

}

}

function toggleCard(el){

const card = el.parentElement
const extra = card.querySelector(".extra")

if(extra.classList.contains("hidden")){

extra.classList.remove("hidden")

el.innerHTML="Collapse ▲"

}else{

extra.classList.add("hidden")

el.innerHTML="Read More ▼"

}

}

function selectCourse(title,department){

const dept = document.getElementById("department")
const course = document.getElementById("course")

if(dept){

dept.value = department

dept.dispatchEvent(new Event("change"))

setTimeout(()=>{

if(course){

for(let option of course.options){

if(option.text === title){

option.selected = true
break

}

}

}

document.getElementById("formContainer")?.scrollIntoView({

behavior:"smooth"

})

},500)

}

}

document.addEventListener("DOMContentLoaded",()=>{

const container = document.getElementById("courseFilterContainer")

if(!container) return

new CourseFilter({

pageType:container.dataset.pageType,
department:container.dataset.department,
coursePrefix:container.dataset.coursePrefix

})

})