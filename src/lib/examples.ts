import type { Language } from '@/types/playground';

export interface CodeExample {
  id: string;
  label: string;
  language: Language;
  code: string;
}

export const CODE_EXAMPLES: CodeExample[] = [
  {
    id: 'js-array-hof',
    label: 'Array higher-order functions',
    language: 'javascript',
    code: `const orders = [
  { id: 1, customer: 'Ava', total: 42.5, status: 'paid' },
  { id: 2, customer: 'Liam', total: 18, status: 'refunded' },
  { id: 3, customer: 'Noah', total: 97.25, status: 'paid' },
  { id: 4, customer: 'Mia', total: 63, status: 'paid' },
];

// filter -> map -> reduce chains data transformations without loops
const paidTotal = orders
  .filter((order) => order.status === 'paid')
  .map((order) => order.total)
  .reduce((sum, total) => sum + total, 0);

console.log('Paid total:', paidTotal.toFixed(2));

const customersByStatus = orders.reduce((groups, order) => {
  (groups[order.status] ??= []).push(order.customer);
  return groups;
}, {});

console.log('Customers by status:', customersByStatus);
console.log('Any over $90?', orders.some((o) => o.total > 90));
console.log('All paid?', orders.every((o) => o.status === 'paid'));
`,
  },
  {
    id: 'js-async-fetch',
    label: 'Async/await with error handling',
    language: 'javascript',
    code: `// Simulates an API call so the example runs without network access
const fakeApi = (path) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (path === '/users/404') {
        reject(new Error('User not found'));
      } else {
        resolve({ id: 1, name: 'Ada Lovelace', path });
      }
    }, 300);
  });

async function loadUser(path) {
  console.log('Fetching', path, '...');
  try {
    const user = await fakeApi(path);
    console.log('Loaded user:', user);
    return user;
  } catch (error) {
    console.error('Failed:', error.message);
    return null;
  } finally {
    console.log('Request finished for', path);
  }
}

async function main() {
  const results = await Promise.all([loadUser('/users/1'), loadUser('/users/404')]);
  console.log('Results:', results);
}

main();
`,
  },
  {
    id: 'js-closures',
    label: 'Closures and counters',
    language: 'javascript',
    code: `function createCounter(start = 0) {
  let count = start; // private state captured by the closure
  return {
    increment: () => ++count,
    reset: () => (count = start),
    get value() {
      return count;
    },
  };
}

const counter = createCounter(10);
counter.increment();
counter.increment();
console.log('Value after two increments:', counter.value);

counter.reset();
console.log('Value after reset:', counter.value);
`,
  },
  {
    id: 'html-dom',
    label: 'DOM manipulation',
    language: 'html',
    code: `<!doctype html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; }
    button { background: #0ea5e9; color: #0f172a; border: 0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    li.done { text-decoration: line-through; opacity: 0.6; }
  </style>
</head>
<body>
  <h2 id="title">Task list</h2>
  <form id="form">
    <input id="input" placeholder="New task" />
    <button type="submit">Add</button>
  </form>
  <ul id="list"></ul>

  <script>
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const list = document.getElementById('list');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!input.value.trim()) return;
      const item = document.createElement('li');
      item.textContent = input.value;
      item.addEventListener('click', () => item.classList.toggle('done'));
      list.appendChild(item);
      console.log('Added task:', input.value);
      input.value = '';
    });
  </script>
</body>
</html>
`,
  },
  {
    id: 'html-css-card',
    label: 'CSS card layout',
    language: 'html',
    code: `<!doctype html>
<html>
<head>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f1f5f9; font-family: system-ui, sans-serif; }
    .card { width: 280px; padding: 24px; border-radius: 16px; background: white; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12); transition: transform 0.2s ease; }
    .card:hover { transform: translateY(-4px); }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #38bdf8, #22c55e); }
    h3 { margin: 16px 0 4px; color: #0f172a; }
    p { margin: 0; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <article class="card">
    <div class="avatar"></div>
    <h3>Jordan Lee</h3>
    <p>Product designer who loves clean interfaces and fast prototypes.</p>
  </article>
</body>
</html>
`,
  },
  {
    id: 'python-basics',
    label: 'Python list comprehensions',
    language: 'python',
    code: `numbers = [3, 8, 1, 9, 4, 7]

squares = [n * n for n in numbers if n % 2 == 1]
print("Odd squares:", squares)

word_counts = {}
for word in "the quick brown fox jumps over the lazy dog the end".split():
    word_counts[word] = word_counts.get(word, 0) + 1

top = sorted(word_counts.items(), key=lambda kv: kv[1], reverse=True)[:3]
print("Most common:", top)
`,
  },
];

export const DEFAULT_EXAMPLE = CODE_EXAMPLES[0];
