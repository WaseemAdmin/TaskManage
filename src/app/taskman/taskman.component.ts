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

  refreshTasks() 
  {
    this.http.get<Task[]>(this.APIurl + 'GetTasks').subscribe((data) => {
      this.tasks = data.map((task: Task) => ({
        ...task,
        DueDate: task.DueDate ? this.datePipe.transform(task.DueDate, 'yyyy-MM-dd') : ''
      }));
  
    // Sort tasks based on DueDate, treating null values as distant future
    this.tasks.sort((a, b) => {
      const dateA = a.DueDate ? new Date(a.DueDate) : new Date('9999-12-31');
      const dateB = b.DueDate ? new Date(b.DueDate) : new Date('9999-12-31');
  
      return dateA.getTime() - dateB.getTime();
      });
  
    // Format the date for display
    this.tasks = this.tasks.map((task: Task) => ({
      ...task,
      DueDate: task.DueDate ? this.datePipe.transform(task.DueDate, 'dd-MM-yyyy') : ''
    }));
    console.log(this.tasks);
    });
  }

  ngOnInit(){  // life cycle method called "ngOnInit" , which gets executed on Page load
    this.refreshTasks();
  }

  // Filtering by Date or Search input
  filteredTasks(): Task[] {
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
        //refresh the tasks data
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
  updateTask(id: any)
  {
    var newUpdatedSubject = (<HTMLInputElement>document.getElementById("UpdatedSub")).value;
    var newUpdatedDescription = (<HTMLInputElement>document.getElementById("UpdatedDesc")).value;
    var newUpdatedDate = (<HTMLInputElement>document.getElementById("UpdatedDate")).value;

    if (!newUpdatedSubject && !newUpdatedDescription && !newUpdatedDate) 
    {
      // All fields are empty
      this.showEditMessage("Missing data : All fields should filled with data");
    } 
    else if (!newUpdatedSubject && !newUpdatedDescription) 
    {
      // Subject and Description are empty
      this.showEditMessage("Missing data: Subject and Description are empty");
    } 
    else if (!newUpdatedSubject && !newUpdatedDate) 
    {
      // Subject and Due Date are empty
      this.showEditMessage("Missing data: Subject and Due Date are empty");
    } 
    else if (!newUpdatedDescription && !newUpdatedDate) 
    {
      // Description and Due Date are empty
      this.showEditMessage("Missing data: Description and Due Date are empty");
    } 
    else if (!newUpdatedSubject) 
    {
      // Subject is empty
      this.showEditMessage("Missing data: Subject is empty");
    } 
    else if (!newUpdatedDescription) 
    {
      // Description is empty
      this.showEditMessage("Missing data: Description is empty");
    } 
    else if (!newUpdatedDate) {
      // Due Date is empty
      this.showEditMessage("Missing data: Due Date is empty");
    }
    else  // non of fileds are empty 
    {
      var parsedNewDate = new Date(newUpdatedDate); 
      var currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (parsedNewDate < currentDate) {
        this.showEditMessage("Due Date should be a future date.");
        return;
      }
      var formData = new FormData();
      formData.append("Subject", newUpdatedSubject);
      formData.append("Description", newUpdatedDescription);
      formData.append("DueDate", newUpdatedDate);

      console.log("non of the fields are empty" + newUpdatedDate);

      this.http.put(this.APIurl + 'UpdateTask?id=' + id, formData).subscribe(data => {
        this.refreshTasks();
      });
      this.showEditForm=false;
    }
  }
 
  // Edit Task functions
  Edit(id:any)
  {
    this.showEditForm = true;
    this.updatedID = id;
  }
 
  sendUpdateRequest(){
    this.updateTask(this.updatedID)
  }

  formatDate(dateString: string | null): string 
  {
    if (!dateString) {
      return '';
    }
  
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }

  // Sign Out button function 
  signOut() {
    // Navigate back to the login page
    this.router.navigate(['/login']);
  }
}