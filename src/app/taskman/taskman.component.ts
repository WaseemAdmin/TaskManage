import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Task } from './task.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-taskman',
  templateUrl: './taskman.component.html',
  styleUrls: ['./taskman.component.css'],
  providers:[DatePipe]
})
export class TaskmanComponent {
  title = 'taskapp';
  showAddForm = false; // Add div
  showEditForm = false; // Edit/Update div 
  updatedID: number | null = null; // To store Update task id
  searchTerm: string = ''; // To store the search term
  updatedSubject:string='';
  updatedDescription:string='';
  updatedDate:string ='';
  filteredTasks: any[] = []; // To store filtered tasks
  filterDate: string = ''; // storing date for filtering
  tasks: Task[] = []; // global array from type Task in task.model.ts
 

  addTaskMsgflag=false; // warning msg for add div
  addTaskMessage='';
  showaddMessage(message:string)
  {
    this.addTaskMessage = message;
    this.addTaskMsgflag = true;
    setTimeout(() => {
      this.addTaskMsgflag = false;
      this.addTaskMessage = ''; 
    }, 5000); // 5 seconds
  }

  EditTaskMsgflag=false; // warning msg for Edit div
  EditTaskMessage='';
  showEditMessage(message:string)
  {
    this.EditTaskMessage = message;
    this.EditTaskMsgflag = true;
    setTimeout(() => {
      this.EditTaskMsgflag = false;
      this.EditTaskMessage = ''; 
    }, 5000); // 5 seconds
  }

   readonly APIurl ="http://localhost:5000/api/taskapp/" //variable to save the API url

   constructor(private http:HttpClient,private datePipe: DatePipe , private router: Router){
   }
 
   refreshTasks() // show all tasks , also called when added / delete and update tasks
   {
     this.http.get<Task[]>(this.APIurl+'GetTasks').subscribe((data) => {
      this.tasks = data.map((task:Task) => ({
        ...task,
        DueDate: task.DueDate ? this.datePipe.transform(task.DueDate, 'dd-MM-yyyy'):''
      }));
      console.log(this.tasks);
     })
   }

   ngOnInit(){  // life cycle method called "ngOnInit" , which gets executed on Page load
     this.refreshTasks();
   }

   // Filtering by Date or Search input
   filteredTasksByDate(): Task[] {
    if (this.filterDate) {
      const filterDateFormatted = this.datePipe.transform(this.filterDate, 'dd-MM-yyyy');
      if (filterDateFormatted) {
        return this.tasks.filter((task: Task) => {
          const taskDueDate = task.DueDate || '';
          return taskDueDate.includes(filterDateFormatted) && task.Subject.toLowerCase().includes(this.searchTerm.toLowerCase());
        });
      }
    }
    return this.tasks.filter((task: Task) => task.Subject.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }
  
  filterTasksByDate() {
    this.filteredTasks = this.filteredTasksByDate();
  }
 
  // Add Task Function 
  addTask() {
    var newSubject = (<HTMLInputElement>document.getElementById("subject")).value;
    var newDescription = (<HTMLInputElement>document.getElementById("description")).value;
    var newDate = (<HTMLInputElement>document.getElementById("dueDate")).value;
  
    var parsedNewDate = new Date(newDate); // Parse into Date object
    // Get the current date
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
  
    if (parsedNewDate < currentDate) {
      // Date is smaller (earlier) than the current date
      this.showaddMessage("Due Date should be a future date.");
    } else if (!newSubject && !newDescription && !newDate) {
      // All fields are empty
      this.showaddMessage("Missing data: Subject, Description, and Due Date are required.");
    } else if (!newSubject && !newDescription) {
      // Subject and Description are empty
      this.showaddMessage("Missing data: Subject and Description are required.");
    } else if (!newSubject && !newDate) {
      // Subject and Due Date are empty
      this.showaddMessage("Missing data: Subject and Due Date are required.");
    } else if (!newDescription && !newDate) {
      // Description and Due Date are empty
      this.showaddMessage("Missing data: Description and Due Date are required.");
    } else if (!newSubject) {
      // Subject is empty
      this.showaddMessage("Missing data: Subject is required.");
    } else if (!newDescription) {
      // Description is empty
      this.showaddMessage("Missing data: Description is required.");
    } else if (!newDate) {
      // Due Date is empty
      this.showaddMessage("Missing data: Due Date is required.");
    } else {
  
      // Add it in a form data to send it to the API
      var formData = new FormData();
      formData.append("Subject", newSubject);
      formData.append("Description", newDescription);
      formData.append("DueDate", newDate);
      this.http.post(this.APIurl + 'AddTask', formData).subscribe((data: any) => {
        //display the result and also refresh the tasks data
        this.refreshTasks();
        this.showAddForm = false;
      });
    }
  }
 
  // Delete Task function
   deleteTask(id:any){
     this.http.delete(this.APIurl+'DeleteTask?id='+id).subscribe(data=>{
       this.refreshTasks();
     })
   }
 
   // Update Task function
   updateTask(id: any, updatedSubject: string, updatedDescription: string, updatedDate: string)
  {
    var UpdatedSubjectss = (<HTMLInputElement>document.getElementById("UpdatedSub")).value;
    var UpdatedDescriptionss = (<HTMLInputElement>document.getElementById("UpdatedDesc")).value;
    var UpdatedDatess = (<HTMLInputElement>document.getElementById("UpdatedDate")).value;

    if (!UpdatedSubjectss && !UpdatedDescriptionss && !UpdatedDatess) 
    {
      // All fields are empty
      this.showEditMessage("Missing data: You have to fill at least one of the fields");
    } 
    else if (!UpdatedSubjectss && !UpdatedDescriptionss) 
    {
      // Subject and Description are empty
        UpdatedSubjectss=updatedSubject;
        UpdatedDescriptionss=updatedDescription;

        var parsedNewDate = new Date(UpdatedDatess); 
        var currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (parsedNewDate < currentDate) {
          this.showEditMessage("Due Date should be a future date.");
          return;
        }

        var formData = new FormData();
        formData.append("Subject", UpdatedSubjectss);
        formData.append("Description", UpdatedDescriptionss);
        formData.append("DueDate", UpdatedDatess);

        this.http.put(this.APIurl + 'UpdateTask?id=' + id, formData).subscribe(data => {
          this.refreshTasks();
        });
        this.updatedSubject='';
        this.updatedDescription='';
        this.updatedDate='';
        this.showEditForm=false;
    } 
    else if (!UpdatedSubjectss && !UpdatedDatess) 
    {
      // Subject and Due Date are empty
        UpdatedSubjectss=updatedSubject;

        const parts = updatedDate.split('-');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const newDate = year + '-' + month + '-' + day;
        UpdatedDatess = newDate;

        var formData = new FormData();
        formData.append("Subject", UpdatedSubjectss);
        formData.append("Description", UpdatedDescriptionss);
        formData.append("DueDate", UpdatedDatess);

        this.http.put(this.APIurl + 'UpdateTask?id=' + id, formData).subscribe(data => {
          this.refreshTasks();
        });
        this.updatedSubject='';
        this.updatedDescription='';
        this.updatedDate='';
        this.showEditForm=false;
    } 
    else if (!UpdatedDescriptionss && !UpdatedDatess) 
    {
      // Description and Due Date are empty
      UpdatedDescriptionss=updatedDescription;
      
      const parts = updatedDate.split('-');
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      const newDate = year + '-' + month + '-' + day;
      UpdatedDatess = newDate;
      
      console.log(UpdatedDatess);
      var formData = new FormData();
      formData.append("Subject", UpdatedSubjectss);
      formData.append("Description", UpdatedDescriptionss);
      formData.append("DueDate", UpdatedDatess);

      this.http.put(this.APIurl + 'UpdateTask?id=' + id, formData).subscribe(data => {
        this.refreshTasks();
      });
      this.updatedSubject='';
      this.updatedDescription='';
      this.updatedDate='';
      this.showEditForm=false;
    } 
    else if (!UpdatedSubjectss) 
    {
      // Subject is empty
      UpdatedSubjectss=updatedSubject;

      var parsedNewDate = new Date(UpdatedDatess); 
      var currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (parsedNewDate < currentDate) {
        this.showEditMessage("Due Date should be a future date.");
        return;
      }
      var formData = new FormData();
      formData.append("Subject", UpdatedSubjectss);
      formData.append("Description", UpdatedDescriptionss);
      formData.append("DueDate", UpdatedDatess);

      this.http.put(this.APIurl + 'UpdateTask?id=' + id, formData).subscribe(data => {
        this.refreshTasks();
      });
      this.updatedSubject='';
      this.updatedDescription='';
      this.updatedDate='';
      this.showEditForm=false;
    } 
    else if (!UpdatedDescriptionss) 
    {
      // Description is empty
      UpdatedDescriptionss=updatedDescription;
      var parsedNewDate = new Date(UpdatedDatess); 
      var currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (parsedNewDate < currentDate) {
        this.showEditMessage("Due Date should be a future date.");
        return;
      }
      var formData = new FormData();
      formData.append("Subject", UpdatedSubjectss);
      formData.append("Description", UpdatedDescriptionss);
      formData.append("DueDate", UpdatedDatess);

      this.http.put(this.APIurl + 'UpdateTask?id=' + id, formData).subscribe(data => {
        this.refreshTasks();
      });
      this.updatedSubject='';
      this.updatedDescription='';
      this.updatedDate='';
      this.showEditForm=false;
    } 
    else if (!UpdatedDatess) 
    {
      // Due Date is empty
      const parts = updatedDate.split('-');
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      const newDate = year + '-' + month + '-' + day;
      UpdatedDatess = newDate;
      var formData = new FormData();
      formData.append("Subject", UpdatedSubjectss);
      formData.append("Description", UpdatedDescriptionss);
      formData.append("DueDate", UpdatedDatess);

      this.http.put(this.APIurl + 'UpdateTask?id=' + id, formData).subscribe(data => {
        this.refreshTasks();
      });
      this.updatedSubject='';
      this.updatedDescription='';
      this.updatedDate='';
      this.showEditForm=false;
    } 
    else  // non of fileds are empty 
    {
      var parsedNewDate = new Date(UpdatedDatess); 
      var currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (parsedNewDate < currentDate) {
        this.showEditMessage("Due Date should be a future date.");
        return;
      }
      var formData = new FormData();
      formData.append("Subject", UpdatedSubjectss);
      formData.append("Description", UpdatedDescriptionss);
      formData.append("DueDate", UpdatedDatess);

      this.http.put(this.APIurl + 'UpdateTask?id=' + id, formData).subscribe(data => {
        this.refreshTasks();
      });
      this.updatedSubject='';
      this.updatedDescription='';
      this.updatedDate='';
      this.showEditForm=false;
    }
  }
 
  // Edit Task functions
   Edit(id:any,updatedSubject: string, updatedDescription: string, updatedDate: string)
   {
     this.showEditForm = true;
     this.updatedID = id;
     this.updatedSubject=updatedSubject;
     this.updatedDescription=updatedDescription;
     this.updatedDate=updatedDate;
     console.log(this.updatedID)
   }
 
   sendUpdateRequest(){
     this.updateTask(this.updatedID ,  this.updatedSubject,this.updatedDescription,this.updatedDate)
   }

   // Sign Out button function 
   signOut() {
    // Navigate back to the login page
    this.router.navigate(['/login']);
  }
}