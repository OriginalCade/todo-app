"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import EditTodoDialog from "@/components/EditTodoDialog";

export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [search, setSearch] = useState("");

  // fetch todos on load
  useEffect(() => {
    fetch("http://localhost:5001/api/todos", {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setTodos(data.items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAddTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await fetch("http://localhost:5001/api/todos", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        due_date: dueDate || null,
      }),
    });

    if (!res.ok) return;

    const newTodo = await res.json();

    setTodos((prev) => [newTodo, ...prev]);

    // reset form
    setTitle("");
    setDescription("");
    setDueDate("");
  }

  const STATUS_ORDER = ["todo", "in_progress", "done"];

  function getNextStatus(current) {
    const index = STATUS_ORDER.indexOf(current);
    return STATUS_ORDER[(index + 1) % STATUS_ORDER.length];
  }

  function statusLabel(status) {
    return status.replace("_", " ");
  }

  function statusColor(status) {
    switch (status) {
      case "done":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  }

  async function handleStatusChange(todo) {
    const nextStatus = getNextStatus(todo.status);

    const res = await fetch(`http://localhost:5001/api/todos/${todo.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) return;

    const updated = await res.json();

    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleLogout() {
    await fetch("http://localhost:5001/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/";
  }

  const visibleTodos = todos
    .filter((todo) => {
      if (statusFilter !== "all" && todo.status !== statusFilter) {
        return false;
      }

      if (search && !todo.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "created_asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "created_desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "due_asc":
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        case "due_desc":
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(b.due_date) - new Date(a.due_date);
        default:
          return 0;
      }
    });

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Todos</CardTitle>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleAddTodo} className="space-y-3">
            <Input
              placeholder="Todo title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <Button type="submit" className="w-full">
              Add Todo
            </Button>
          </form>

          <Input
            placeholder="Search todos by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex justify-center gap-20">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="created_desc">Newest</option>
              <option value="created_asc">Oldest</option>
              <option value="due_asc">Due soon</option>
              <option value="due_desc">Due last</option>
            </select>
          </div>

          {loading && <p className="text-sm text-black">Loading…</p>}

          {Array.isArray(visibleTodos) && visibleTodos.length > 0 ? (
            <ul className="space-y-2">
              {visibleTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="border rounded p-2 flex justify-between items-center"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{todo.title}</span>

                    {todo.description && (
                      <span className="text-sm text-[#6c757d]">
                        {todo.description}
                      </span>
                    )}

                    {todo.due_date && (
                      <span className="text-xs text-[#6c757d]">
                        Due: {todo.due_date.slice(0, 10)}
                      </span>
                    )}

                    <span
                      className={`text-xs font-medium mt-1 ${statusColor(
                        todo.status
                      )}`}
                    >
                      Status: {statusLabel(todo.status)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(todo)}
                    >
                      Next
                    </Button>

                    <EditTodoDialog todo={todo} setTodos={setTodos} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-black">No todos yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
