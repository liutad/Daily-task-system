const { useState, useEffect, useMemo } = React;

const PRIORITIES = ['high', 'medium', 'low'];
const FILTERS = ['all', 'active', 'completed'];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function loadTasks() {
  try { return JSON.parse(localStorage.getItem('dts_tasks') || '[]'); } catch { return []; }
}
function saveTasks(tasks) {
  localStorage.setItem('dts_tasks', JSON.stringify(tasks));
}
function loadStreak() {
  try { return JSON.parse(localStorage.getItem('dts_streak') || '{"count":0,"lastDate":""}'); } catch { return {count:0,lastDate:''}; }
}
function saveStreak(s) {
  localStorage.setItem('dts_streak', JSON.stringify(s));
}

function PriorityBadge({ p }) {
  const colors = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${colors[p]}`}>{p}</span>;
}

function TaskCard({ task, onToggle, onDelete }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 flex gap-3 items-start priority-${task.priority} ${task.done ? 'task-done' : ''}`}>
      <button onClick={() => onToggle(task.id)} className="mt-1 flex-shrink-0 btn">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
        }`}>
          {task.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="task-title font-medium text-gray-800 text-sm">{task.title}</span>
          <PriorityBadge p={task.priority} />
        </div>
        {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
        {task.dueDate && (
          <p className={`text-xs mt-1 ${task.dueDate < getToday() && !task.done ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
            Due: {task.dueDate}
          </p>
        )}
      </div>
      <button onClick={() => onDelete(task.id)} className="text-gray-300 hover:text-red-400 transition-colors btn flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

function AddTaskModal({ onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(getToday());

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ id: Date.now(), title: title.trim(), description: desc.trim(), priority, dueDate, done: false, createdAt: getToday() });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 btn">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional details..." rows={2} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg py-2.5 text-sm btn transition-colors">
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [streak, setStreak] = useState(loadStreak);
  const today = getToday();

  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => { saveStreak(streak); }, [streak]);

  useEffect(() => {
    const todayTasks = tasks.filter(t => t.dueDate === today || !t.dueDate);
    const allDone = todayTasks.length > 0 && todayTasks.every(t => t.done);
    if (allDone && streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      setStreak({ count: streak.lastDate === yesterday ? streak.count + 1 : 1, lastDate: today });
    }
  }, [tasks]);

  function addTask(task) { setTasks(prev => [task, ...prev]); }
  function toggleTask(id) { setTasks(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t)); }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function clearCompleted() { setTasks(prev => prev.filter(t => !t.done)); }

  const todayTasks = useMemo(() => tasks.filter(t => !t.dueDate || t.dueDate === today || (t.dueDate < today && !t.done)), [tasks, today]);
  const filteredTasks = useMemo(() => {
    const base = todayTasks;
    if (filter === 'active') return base.filter(t => !t.done);
    if (filter === 'completed') return base.filter(t => t.done);
    return base;
  }, [todayTasks, filter]);

  const total = todayTasks.length;
  const done = todayTasks.filter(t => t.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100">
      {showModal && <AddTaskModal onAdd={addTask} onClose={() => setShowModal(false)} />}
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Tasks</h1>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'})}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl">{streak.count > 0 ? '🔥' : '⭕'}</div>
            <p className="text-xs text-gray-500">{streak.count} day streak</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[['Total', total, 'bg-indigo-50 text-indigo-700'], ['Done', done, 'bg-green-50 text-green-700'], ['Left', total - done, 'bg-amber-50 text-amber-700']].map(([label, val, cls]) => (
            <div key={label} className={`${cls} rounded-xl p-3 text-center`}>
              <div className="text-2xl font-bold">{val}</div>
              <div className="text-xs font-semibold uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span><span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{width: `${progress}%`}} />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === f ? 'bg-indigo-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}>{f}</button>
          ))}
          {done > 0 && (
            <button onClick={clearCompleted} className="btn ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors">Clear done</button>
          )}
        </div>

        {/* Task list */}
        <div className="space-y-3 mb-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">{filter === 'completed' ? '🎉' : '📋'}</div>
              <p className="text-sm">{filter === 'completed' ? 'No completed tasks yet' : 'No tasks here — add one!'}</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))
          )}
        </div>

        {/* Add button */}
        <button onClick={() => setShowModal(true)} className="btn w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 shadow-md transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Task
        </button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
