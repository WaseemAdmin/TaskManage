using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskAppController : ControllerBase
    {
        // Get the connection details
        private IConfiguration _configuration;
        public TaskAppController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        [Route("GetTasks")]
        public JsonResult GetTasks()
        {
            string query = "select * from dbo.tasks"; // select query to get the data 
            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("taskAppDBCon");
            SqlDataReader myReader; 
            using(SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using(SqlCommand myCommand = new SqlCommand(query,myCon))
                {
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult(table); // once data available in data table we will return this as Json result 
        }

        [HttpPost]
        [Route("GetUser")]
        public JsonResult GetUser([FromBody] UserModel userModel)
        {
            string query = "select * from dbo.Users WHERE userName = @userName COLLATE Latin1_General_BIN AND password = @password";

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("taskAppDBCon");
            SqlDataReader myReader;

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@userName", userModel.userName); // Retrieve username from userModel
                    myCommand.Parameters.AddWithValue("@password", userModel.password); // Retrieve password from userModel
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            if (table.Rows.Count > 0)
            {
                // User found
                return new JsonResult("User Found");
            }
            else
            {
                // User not found
                return new JsonResult("User Not Found");
            }
        }

        [HttpPost]
        [Route("AddTask")]
        public JsonResult AddTask([FromForm] TaskModel newTask)
        {
            string query = "INSERT INTO dbo.tasks (Subject, Description, DueDate) VALUES (@Subject, @Description, @DueDate)";
            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("taskAppDBCon");
            SqlDataReader myReader;

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@Subject", newTask.Subject);
                    myCommand.Parameters.AddWithValue("@Description", newTask.Description);

                    // Convert the string date to DateTime
                    DateTime dueDate = DateTime.ParseExact(newTask.DueDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);

                    // Use a SqlParameter of SqlDbType.Date
                    SqlParameter dueDateParam = new SqlParameter("@DueDate", SqlDbType.Date);
                    dueDateParam.Value = dueDate;
                    myCommand.Parameters.Add(dueDateParam);

                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult("Added Successfully");
        }

        [HttpPost]
        [Route("AddUser")]
        public IActionResult AddUser([FromForm] UserModel newUser)
        {
            string query = "INSERT INTO dbo.Users (userName, password) VALUES (@userName, @password)";
            string sqlDatasource = _configuration.GetConnectionString("taskAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            using (SqlCommand myCommand = new SqlCommand(query, myCon))
            {
                myCommand.Parameters.AddWithValue("@userName", newUser.userName);
                myCommand.Parameters.AddWithValue("@password", newUser.password);

                try
                {
                    myCon.Open();
                    int rowsAffected = myCommand.ExecuteNonQuery();

                    if (rowsAffected > 0)
                    {
                        // User added successfully
                        myCon.Close();
                        return Ok("User added successfully");
                    }
                    else
                    {
                        // No rows affected, something went wrong
                        myCon.Close();
                        return BadRequest("User not added");
                    }
                }
                catch (Exception ex)
                {
                    // Handle any exceptions, and return an internal server error
                    myCon.Close();
                    return StatusCode(500, $"Internal Server Error: {ex.Message}");
                }
            }
        }


        [HttpPut]
        [Route("UpdateTask")]
        public JsonResult UpdateTask(int id, [FromForm] TaskModel updateModel)
        {
            string query = "update dbo.tasks set Subject = @UpdatedSubject,Description = @UpdatedDescription,DueDate = @UpdatedDueDate WHERE id = @TaskID";
            using (SqlConnection myCon = new SqlConnection(_configuration.GetConnectionString("taskAppDBCon")))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@UpdatedSubject", updateModel.Subject);
                    myCommand.Parameters.AddWithValue("@UpdatedDescription", updateModel.Description);
                    myCommand.Parameters.AddWithValue("@UpdatedDueDate", updateModel.DueDate);
                    myCommand.Parameters.AddWithValue("@TaskID", id);

                    int rowsAffected = myCommand.ExecuteNonQuery();

                    if (rowsAffected > 0)
                    {
                        myCon.Close();
                        return new JsonResult("Task updated successfully");

                    }
                    else
                    {
                        myCon.Close();
                        return new JsonResult("Task not found or not updated");
                    }
                }
            }
        }

        [HttpDelete]
        [Route("DeleteTask")]
        public JsonResult DeleteTask(int id)
        {
            string query = "delete from dbo.tasks where id=@id"; // delete from db 
            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("taskAppDBCon");
            SqlDataReader myReader;
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@id", id);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult("Deleted Successfully");
        }


    }
}