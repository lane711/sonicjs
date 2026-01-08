-- Code Examples Plugin Migration
-- Creates code_examples table for the code examples plugin
-- This demonstrates a code-based collection for storing and managing code snippets

CREATE TABLE IF NOT EXISTS code_examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT,
  tags TEXT,
  isPublished INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_code_examples_published ON code_examples(isPublished);
CREATE INDEX IF NOT EXISTS idx_code_examples_sort_order ON code_examples(sortOrder);
CREATE INDEX IF NOT EXISTS idx_code_examples_language ON code_examples(language);
CREATE INDEX IF NOT EXISTS idx_code_examples_category ON code_examples(category);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS code_examples_updated_at
  AFTER UPDATE ON code_examples
BEGIN
  UPDATE code_examples SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- Insert plugin record
INSERT OR IGNORE INTO plugins (name, display_name, description, version, status, category, settings) VALUES
('code-examples',
 'Code Examples',
 'Manage code snippets and examples with syntax highlighting support. Perfect for documentation and tutorials.',
 '1.0.0',
 'active',
 'content',
 '{"defaultPublished": true, "supportedLanguages": ["javascript", "typescript", "python", "go", "rust", "java", "php", "ruby", "sql"]}');

-- Insert sample code examples
INSERT OR IGNORE INTO code_examples (title, description, code, language, category, tags, isPublished, sortOrder) VALUES
('React useState Hook',
 'Basic example of using the useState hook in React for managing component state.',
 'import { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;',
 'javascript',
 'frontend',
 'react,hooks,state',
 1,
 1),

('TypeScript Interface Example',
 'Defining a TypeScript interface for type-safe objects.',
 'interface User {
  id: string;
  email: string;
  name: string;
  role: ''admin'' | ''editor'' | ''viewer'';
  createdAt: Date;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}

const user: User = {
  id: ''123'',
  email: ''user@example.com'',
  name: ''John Doe'',
  role: ''admin'',
  createdAt: new Date()
};

console.log(greetUser(user));',
 'typescript',
 'backend',
 'typescript,types,interface',
 1,
 2),

('Python List Comprehension',
 'Elegant way to create lists in Python using list comprehensions.',
 '# Basic list comprehension
squares = [x**2 for x in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With condition
even_squares = [x**2 for x in range(10) if x % 2 == 0]
print(even_squares)  # [0, 4, 16, 36, 64]

# Nested list comprehension
matrix = [[i+j for j in range(3)] for i in range(3)]
print(matrix)  # [[0, 1, 2], [1, 2, 3], [2, 3, 4]]',
 'python',
 'general',
 'python,lists,comprehension',
 1,
 3),

('SQL Join Example',
 'Common SQL JOIN patterns for combining data from multiple tables.',
 '-- INNER JOIN: Returns only matching rows
SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- LEFT JOIN: Returns all users, even without orders
SELECT users.name, orders.total
FROM users
LEFT JOIN orders ON users.id = orders.user_id;

-- Multiple JOINs
SELECT
  users.name,
  orders.order_date,
  products.name AS product_name
FROM users
INNER JOIN orders ON users.id = orders.user_id
INNER JOIN order_items ON orders.id = order_items.order_id
INNER JOIN products ON order_items.product_id = products.id;',
 'sql',
 'database',
 'sql,joins,queries',
 1,
 4),

('Go Error Handling',
 'Idiomatic error handling pattern in Go.',
 'package main

import (
	"errors"
	"fmt"
)

func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}

func main() {
	result, err := divide(10, 2)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Printf("Result: %.2f\n", result)

	// This will error
	_, err = divide(10, 0)
	if err != nil {
		fmt.Println("Error:", err)
	}
}',
 'go',
 'backend',
 'go,error-handling,functions',
 1,
 5);
