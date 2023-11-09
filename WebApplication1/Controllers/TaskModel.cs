namespace WebApplication1.Controllers
{
    public class TaskModel
    {
        public int ID { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string DueDate { get; set; }  // Date as a string in "YYYY-MM-DD" format
    }
}
