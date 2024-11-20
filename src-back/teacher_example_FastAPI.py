from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()


# Task schemas
# Those are Pydantic models, they define the structure of the data
# They will be used by FastAPI to validate the data, to convert
# it to and from JSON and to provide the OpenAPI documentation
class TaskCreation(BaseModel):
    title: str
    description: Optional[str] = None
    status: str


class Task(TaskCreation):
    id: str


# Sample in-memory data storage for tasks
tasks = [
    Task(id="1", title="Task 1", description="Description 1", status="To Do"),
    Task(id="2", title="Task 2", description="", status="In Progress"),
    Task(id="3", title="Task 3", description="Description 3", status="Done"),
]
task_counter = len(tasks) + 1


# Endpoints for the API
# Retrieve all tasks
@app.get("/tasks", response_model=List[Task], tags=["Tasks"])
async def get_tasks():
    # Return the list of tasks,
    # the response model will handle the conversion to JSON
    return tasks


# Create a new task
@app.post("/tasks", response_model=Task, tags=["Tasks"])
async def create_task(task: TaskCreation):
    global task_counter

    # Create a new task with the provided data
    new_task = Task(id=str(task_counter), **task.model_dump())

    # Add the task to the list
    tasks.append(new_task)
    task_counter += 1

    # Return the created task
    return new_task


# Retrieve a task by ID
@app.get("/tasks/{task_id}", response_model=Task, tags=["Tasks"])
async def get_task(task_id: str = Path(..., description="The ID of the task to retrieve")):
    # Get the task
    task = next((t for t in tasks if t.id == task_id), None)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    # Return the task
    return task


# Update an existing task by ID
@app.put("/tasks/{task_id}", response_model=Task, tags=["Tasks"])
async def update_task(task_id: str, task_data: TaskCreation):
    # Get the task
    task = next((t for t in tasks if t.id == task_id), None)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update the task with the new data
    if "title" in task_data:
        task.title = task_data.title
    if "description" in task_data:
        task.description = task_data.description
    if "status" in task_data:
        task.status = task_data.status

    # Return the updated task
    return task


# Delete a task by ID
@app.delete("/tasks/{task_id}", status_code=204, tags=["Tasks"])
async def delete_task(task_id: str):
    global tasks

    # Find if the task exists
    task = next((t for t in tasks if t.id == task_id), None)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    # Remove the task from the list
    tasks = [t for t in tasks if t.id != task_id]
    return
