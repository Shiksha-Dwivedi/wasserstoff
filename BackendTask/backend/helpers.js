import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "todos.json");

export const readTodos = () => {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
};

export const writeTodos = (todos) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos));
};
