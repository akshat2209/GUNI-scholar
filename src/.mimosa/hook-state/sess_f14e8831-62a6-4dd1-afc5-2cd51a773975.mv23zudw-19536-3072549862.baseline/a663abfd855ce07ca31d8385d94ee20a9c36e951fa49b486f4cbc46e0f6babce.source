// GUNI Scholar mock data. Seeded so the illustrative scenario from the
// problem statement holds across every role: student CS21_013 (Aarav Shah)
// has a 52 percent assessment average in DAA, a three submission late streak,
// weak Dynamic Programming and Graph Theory topics, and declining engagement.

export const users = [
  { id: 'stu-013', role: 'student', name: 'Aarav Shah', email: 'aarav.shah@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS013', status: 'active' },
  { id: 'stu-001', role: 'student', name: 'Priya Patel', email: 'priya.patel@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS001', status: 'active' },
  { id: 'stu-002', role: 'student', name: 'Rohan Desai', email: 'rohan.desai@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS002', status: 'active' },
  { id: 'stu-003', role: 'student', name: 'Ishita Joshi', email: 'ishita.joshi@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS003', status: 'active' },
  { id: 'stu-004', role: 'student', name: 'Kunal Modi', email: 'kunal.modi@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS004', status: 'active' },
  { id: 'stu-005', role: 'student', name: 'Meera Trivedi', email: 'meera.trivedi@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS005', status: 'active' },
  { id: 'stu-006', role: 'student', name: 'Dev Patel', email: 'dev.patel@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS006', status: 'active' },
  { id: 'stu-007', role: 'student', name: 'Ananya Shah', email: 'ananya.shah@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS007', status: 'active' },
  { id: 'stu-008', role: 'student', name: 'Yash Raval', email: 'yash.raval@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS008', status: 'active' },
  { id: 'stu-009', role: 'student', name: 'Nidhi Chauhan', email: 'nidhi.chauhan@ganpatuni.ac.in', password: 'guni123', dept: 'B.Tech CSE', sem: 5, rollNo: '21CS009', status: 'suspended' },
  { id: 'fac-01', role: 'faculty', name: 'Dr. Nirav Bhatt', email: 'nirav.bhatt@ganpatuni.ac.in', password: 'guni123', dept: 'Computer Engineering', staffId: 'CE-F-042', status: 'active' },
  { id: 'fac-02', role: 'faculty', name: 'Dr. Kinjal Mehta', email: 'kinjal.mehta@ganpatuni.ac.in', password: 'guni123', dept: 'Computer Engineering', staffId: 'CE-F-037', status: 'active' },
  { id: 'fac-03', role: 'faculty', name: 'Prof. Ritesh Amin', email: 'ritesh.amin@ganpatuni.ac.in', password: 'guni123', dept: 'Computer Engineering', staffId: 'CE-F-051', status: 'active' },
  { id: 'dean-01', role: 'dean', name: 'Dr. Kalpesh Patel', email: 'kalpesh.patel@ganpatuni.ac.in', password: 'guni123', dept: 'Faculty of Engineering', staffId: 'FOE-D-006', status: 'active' },
  { id: 'adm-01', role: 'admin', name: 'Sneha Kulkarni', email: 'sneha.kulkarni@ganpatuni.ac.in', password: 'guni123', dept: 'Administration', staffId: 'ADM-118', status: 'active' },
]

export const demoPassword = 'guni123'

export const courses = [
  { id: 'cs301', code: '20CS301', title: 'Design and Analysis of Algorithms', short: 'DAA', dept: 'B.Tech CSE', sem: 5, credits: 4, facultyId: 'fac-01', color: '#c41e24' },
  { id: 'cs302', code: '20CS302', title: 'Database Management Systems', short: 'DBMS', dept: 'B.Tech CSE', sem: 5, credits: 4, facultyId: 'fac-02', color: '#b08733' },
  { id: 'cs303', code: '20CS303', title: 'Operating Systems', short: 'OS', dept: 'B.Tech CSE', sem: 5, credits: 3, facultyId: 'fac-01', color: '#175cd3' },
  { id: 'cs304', code: '20CS304', title: 'Computer Networks', short: 'CN', dept: 'B.Tech CSE', sem: 5, credits: 3, facultyId: 'fac-02', color: '#067647' },
  { id: 'cs305', code: '20CS305', title: 'Software Engineering', short: 'SE', dept: 'B.Tech CSE', sem: 5, credits: 3, facultyId: 'fac-03', color: '#6941c6' },
]

// Students enrolled per course (demo student enrolled in first four).
export const enrollments = {
  cs301: ['stu-001', 'stu-002', 'stu-003', 'stu-004', 'stu-005', 'stu-006', 'stu-007', 'stu-008', 'stu-013'],
  cs302: ['stu-001', 'stu-002', 'stu-003', 'stu-004', 'stu-005', 'stu-006', 'stu-007', 'stu-013'],
  cs303: ['stu-002', 'stu-003', 'stu-004', 'stu-005', 'stu-006', 'stu-007', 'stu-013'],
  cs304: ['stu-001', 'stu-003', 'stu-004', 'stu-005', 'stu-006', 'stu-008', 'stu-013'],
  cs305: ['stu-002', 'stu-005', 'stu-006'],
}

// Topics with prerequisite chains. DAA carries the full chain used by the
// knowledge gap dependency map; other courses are lighter chains.
export const topics = {
  cs301: [
    { id: 't-301-1', name: 'Algorithm Complexity', short: 'Complexity', prereqs: [] },
    { id: 't-301-2', name: 'Divide and Conquer', short: 'D and C', prereqs: ['t-301-1'] },
    { id: 't-301-3', name: 'Graph Theory', short: 'Graphs', prereqs: ['t-301-1'] },
    { id: 't-301-4', name: 'Greedy Algorithms', short: 'Greedy', prereqs: ['t-301-2'] },
    { id: 't-301-5', name: 'Dynamic Programming', short: 'DP', prereqs: ['t-301-2', 't-301-3'] },
    { id: 't-301-6', name: 'Backtracking', short: 'Backtracking', prereqs: ['t-301-5'] },
  ],
  cs302: [
    { id: 't-302-1', name: 'ER Modeling', short: 'ER', prereqs: [] },
    { id: 't-302-2', name: 'SQL Queries', short: 'SQL', prereqs: ['t-302-1'] },
    { id: 't-302-3', name: 'Normalization', short: 'Normal forms', prereqs: ['t-302-2'] },
    { id: 't-302-4', name: 'Transactions', short: 'Transactions', prereqs: ['t-302-2'] },
  ],
  cs303: [
    { id: 't-303-1', name: 'Processes and Threads', short: 'Processes', prereqs: [] },
    { id: 't-303-2', name: 'CPU Scheduling', short: 'Scheduling', prereqs: ['t-303-1'] },
    { id: 't-303-3', name: 'Memory Management', short: 'Memory', prereqs: ['t-303-1'] },
    { id: 't-303-4', name: 'File Systems', short: 'File systems', prereqs: ['t-303-3'] },
  ],
  cs304: [
    { id: 't-304-1', name: 'OSI and TCP/IP Layers', short: 'Layers', prereqs: [] },
    { id: 't-304-2', name: 'TCP Congestion Control', short: 'TCP', prereqs: ['t-304-1'] },
    { id: 't-304-3', name: 'Routing Algorithms', short: 'Routing', prereqs: ['t-304-1'] },
  ],
}

export const resources = [
  { id: 'r-01', courseId: 'cs301', topicId: 't-301-1', title: 'Asymptotic Notation Explained', type: 'slides', size: '2.1 MB', week: 1 },
  { id: 'r-02', courseId: 'cs301', topicId: 't-301-1', title: 'Big-O Practice Set with Solutions', type: 'practice', size: '0.6 MB', week: 2 },
  { id: 'r-03', courseId: 'cs301', topicId: 't-301-2', title: 'Divide and Conquer Lecture Notes', type: 'notes', size: '1.4 MB', week: 3 },
  { id: 'r-04', courseId: 'cs301', topicId: 't-301-3', title: 'BFS and DFS Fundamentals', type: 'video', size: '18 min', week: 5 },
  { id: 'r-05', courseId: 'cs301', topicId: 't-301-3', title: 'Graph Representation Cheat Sheet', type: 'notes', size: '0.4 MB', week: 5 },
  { id: 'r-06', courseId: 'cs301', topicId: 't-301-4', title: 'Greedy Algorithms and Matroids', type: 'notes', size: '1.1 MB', week: 6 },
  { id: 'r-07', courseId: 'cs301', topicId: 't-301-5', title: 'Memoization: From Recursion to DP', type: 'video', size: '12 min', week: 7 },
  { id: 'r-08', courseId: 'cs301', topicId: 't-301-5', title: 'Dynamic Programming Problem Ladder', type: 'practice', size: '0.8 MB', week: 7 },
  { id: 'r-09', courseId: 'cs301', topicId: 't-301-6', title: 'Backtracking Templates for N-Queens and Sudoku', type: 'notes', size: '0.9 MB', week: 9 },
  { id: 'r-10', courseId: 'cs302', topicId: 't-302-2', title: 'SQL Join Strategies Worked Examples', type: 'notes', size: '1.3 MB', week: 4 },
  { id: 'r-11', courseId: 'cs302', topicId: 't-302-3', title: 'Normal Forms Up to BCNF', type: 'slides', size: '2.6 MB', week: 6 },
  { id: 'r-12', courseId: 'cs303', topicId: 't-303-2', title: 'Scheduling Algorithms Comparison Table', type: 'notes', size: '0.5 MB', week: 3 },
  { id: 'r-13', courseId: 'cs304', topicId: 't-304-2', title: 'TCP Congestion Control Walkthrough', type: 'video', size: '15 min', week: 4 },
]

// Assignments. Demo student has late streak of 3 (asg-02, asg-03, asg-04)
// and one open assignment (asg-05) tied to the weak DP topic.
export const assignments = [
  { id: 'asg-01', courseId: 'cs301', topicId: 't-301-1', title: 'Asymptotic Analysis Worksheet', released: 'W1 Mon', due: 'W2 Fri', maxMarks: 100, description: 'Derive tight Big-O and Big-Theta bounds for the twelve growth functions listed in the worksheet. Show your reasoning for each.' },
  { id: 'asg-02', courseId: 'cs301', topicId: 't-301-2', title: 'Recurrence Relations Problem Set', released: 'W3 Mon', due: 'W4 Fri', maxMarks: 100, description: 'Solve recurrences using substitution and the Master theorem. Write the recursion tree for problems 4 and 7.' },
  { id: 'asg-03', courseId: 'cs301', topicId: 't-301-3', title: 'Graph Traversals Lab', released: 'W5 Mon', due: 'W6 Fri', maxMarks: 100, description: 'Implement BFS and DFS over the provided campus graph dataset and answer the connectivity questions.' },
  { id: 'asg-04', courseId: 'cs301', topicId: 't-301-4', title: 'Greedy Strategies Report', released: 'W6 Mon', due: 'W7 Fri', maxMarks: 100, description: 'Compare greedy and optimal solutions for the interval scheduling and coin change tasks. State where greedy fails and why.' },
  { id: 'asg-05', courseId: 'cs301', topicId: 't-301-5', title: 'Dynamic Programming Assignment', released: 'W7 Mon', due: 'in 2 days', maxMarks: 100, description: 'Write bottom-up solutions for LIS, 0/1 knapsack and coin change. Include the memoised top-down version for knapsack.' },
  { id: 'asg-06', courseId: 'cs302', topicId: 't-302-2', title: 'SQL Query Exercise Set', released: 'W3 Mon', due: 'W4 Fri', maxMarks: 50, description: 'Write the twenty SQL queries described in the handout against the university schema.' },
  { id: 'asg-07', courseId: 'cs303', topicId: 't-303-2', title: 'Scheduling Algorithms Simulation', released: 'W4 Mon', due: 'W5 Fri', maxMarks: 50, description: 'Simulate FCFS, SJF and Round Robin on the given process mix and compare average waiting times.' },
]

// Submission records. status: on-time | late | pending | evaluated.
export const submissions = [
  { id: 'sub-01', assignmentId: 'asg-01', studentId: 'stu-013', submittedAt: 'W2 Thu', fileName: 'aarav_asymptotic.pdf', status: 'evaluated', marks: 55, feedback: 'Bounds are mostly right but several tightness arguments are hand-wavy. Revisit the lower bound proof style from lecture 3.' },
  { id: 'sub-02', assignmentId: 'asg-02', studentId: 'stu-013', submittedAt: 'W5 Mon (late)', fileName: 'aarav_recurrences.pdf', status: 'evaluated', marks: 65, feedback: 'Master theorem cases are applied correctly. Substitution steps need clearer induction hypotheses.' },
  { id: 'sub-03', assignmentId: 'asg-03', studentId: 'stu-013', submittedAt: 'W7 Tue (late)', fileName: 'aarav_graphlab.zip', status: 'evaluated', marks: 58, feedback: 'DFS works but the visited bookkeeping breaks on disconnected components. See the cheat sheet on the resources page.' },
  { id: 'sub-04', assignmentId: 'asg-04', studentId: 'stu-013', submittedAt: 'W8 Mon (late)', fileName: 'aarav_greedy.pdf', status: 'evaluated', marks: 71, feedback: 'Good failure analysis for coin change. Interval scheduling proof is complete.' },
  { id: 'sub-06', assignmentId: 'asg-06', studentId: 'stu-013', submittedAt: 'W4 Thu', fileName: 'aarav_sql.pdf', status: 'evaluated', marks: 44, feedback: 'Strong overall. Nested aggregation in query 16 needs a HAVING clause.' },
  { id: 'sub-07', assignmentId: 'asg-07', studentId: 'stu-013', submittedAt: 'W5 Thu', fileName: 'aarav_schedsim.zip', status: 'evaluated', marks: 41, feedback: 'Round Robin quantum handling is correct. Add the Gantt chart to the report.' },
]

// Assessments (quizzes). Each question is tagged with a topic so per-topic
// performance and the class confusion heatmap can be computed.
export const assessments = [
  {
    id: 'qz-301-1', courseId: 'cs301', title: 'Quiz 1: Asymptotic Notation', week: 2, published: true,
    questions: [
      { id: 'c1', topicId: 't-301-1', text: 'What is the tight asymptotic bound for T(n) = 3n^2 + 100n + 500?', options: ['O(n)', 'O(n^2)', 'O(n^3)', 'O(log n)'], correct: 1, explanation: 'The dominant term is 3n^2. Lower order terms and constants are dropped, so the tight bound is Theta(n^2).' },
      { id: 'c2', topicId: 't-301-1', text: 'f(n) = O(g(n)) means, for large enough n:', options: ['f grows strictly faster than g', 'f is bounded above by c times g', 'f equals g eventually', 'g is bounded above by f'], correct: 1, explanation: 'Big-O is an upper bound: there exist constants c and n0 such that f(n) <= c * g(n) for all n >= n0.' },
      { id: 'c3', topicId: 't-301-1', text: 'Which growth rate grows fastest as n increases?', options: ['n log n', 'n^1.5', '2^n', 'n^2'], correct: 2, explanation: 'Exponential 2^n dominates every polynomial growth rate, including n^2 and n^1.5.' },
      { id: 'c4', topicId: 't-301-1', text: 'Theta notation describes:', options: ['Only an upper bound', 'Only a lower bound', 'Both upper and lower bounds', 'An average of bounds'], correct: 2, explanation: 'Theta binds the function from above and below with constant factors, so it describes tight growth.' },
      { id: 'c5', topicId: 't-301-1', text: 'log_b(n) and log_c(n) differ by:', options: ['A constant factor', 'A factor of log n', 'A factor of n', 'They are unrelated'], correct: 0, explanation: 'Logarithms in different bases differ only by the constant factor log_c(b), which Big-O ignores.' },
      { id: 'c6', topicId: 't-301-1', text: 'If T(n) = T(n/2) + O(1), then T(n) is:', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correct: 1, explanation: 'Halving the problem with constant work per level gives a logarithmic number of levels: O(log n).' },
      { id: 'c7', topicId: 't-301-1', text: 'Little-o notation means:', options: ['Tight bound', 'Upper bound but not tight', 'Lower bound but not tight', 'Average bound'], correct: 1, explanation: 'f = o(g) means f grows strictly slower than g, an upper bound that is not tight.' },
      { id: 'c8', topicId: 't-301-1', text: 'Sum 1 + 2 + 3 + ... + n grows as:', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'], correct: 2, explanation: 'The sum equals n(n+1)/2, which is Theta(n^2).' },
      { id: 'c9', topicId: 't-301-1', text: 'Which statement about O(n^2) and Omega(n^2) for the same function is true?', options: ['Impossible to hold together', 'Holds when the function is Theta(n^2)', 'Means the function is O(n)', 'Only one can be true'], correct: 1, explanation: 'A function bounded above and below by n^2 is exactly Theta(n^2).' },
      { id: 'c10', topicId: 't-301-1', text: 'An algorithm taking 1 microsecond for n=1000 and doubling work when n doubles is:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correct: 2, explanation: 'Work grows proportionally with input size, which is linear time.' },
    ],
  },
  {
    id: 'qz-301-2', courseId: 'cs301', title: 'Quiz 2: Divide and Conquer', week: 4, published: true,
    questions: [
      { id: 'd1', topicId: 't-301-2', text: 'Master theorem for T(n) = 2T(n/2) + O(n) gives:', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], correct: 1, explanation: 'Equal split with linear merge work is case 2 of the Master theorem: n^(log_2 2) = n, so T(n) = O(n log n).' },
      { id: 'd2', topicId: 't-301-2', text: 'Merge sort worst case complexity:', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], correct: 1, explanation: 'Merge sort splits in half and merges in linear time at every level regardless of input, so worst case is O(n log n).' },
      { id: 'd3', topicId: 't-301-2', text: 'Binary search recurrence T(n) = T(n/2) + O(1) solves to:', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correct: 1, explanation: 'One constant-work step per halving level gives logarithmic depth, so O(log n).' },
      { id: 'd4', topicId: 't-301-2', text: 'Which problem is solved naturally by divide and conquer?', options: ['Finding shortest path in a weighted graph', 'Counting inversions in an array', 'Building a hash table', 'Memoising a fib function'], correct: 1, explanation: 'Inversion counting splits the array, recursively counts both halves and cross-counts during merge.' },
      { id: 'd5', topicId: 't-301-2', text: 'Quicksort worst case occurs when:', options: ['Array is random', 'Pivot always splits evenly', 'Pivot is always extreme', 'Array has duplicates only'], correct: 2, explanation: 'Extreme pivots give partitions of size 0 and n-1, degrading depth to O(n) and total time to O(n^2).' },
      { id: 'd6', topicId: 't-301-2', text: 'The combine step of merge sort costs:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correct: 2, explanation: 'Merging two sorted halves walks each element once, so linear in the number of elements.' },
      { id: 'd7', topicId: 't-301-2', text: 'Number of levels in a recursion tree of T(n) = 2T(n/2):', options: ['log n', 'n', 'n log n', 'sqrt(n)'], correct: 0, explanation: 'Halving depth means the tree has log2(n) levels before reaching size 1.' },
      { id: 'd8', topicId: 't-301-2', text: 'Strassen algorithm improves on matrix multiply by:', options: ['Reducing multiplications recursively', 'Using hash maps', 'Sorting first', 'Greedy pivoting'], correct: 0, explanation: 'Strassen reduces 8 multiplications to 7 per split, and the recurrence T(n)=7T(n/2)+O(n^2) beats the cubic classic.' },
      { id: 'd9', topicId: 't-301-2', text: 'Divide and conquer differs from decrease and conquer because it:', options: ['Uses no recursion', 'Solves multiple subproblems', 'Always sorts', 'Has no combine step'], correct: 1, explanation: 'Divide and conquer branches into several independent subproblems; decrease and conquer reduces to one smaller instance.' },
      { id: 'd10', topicId: 't-301-2', text: 'T(n) = 4T(n/2) + O(n) solves to:', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n^2 log n)'], correct: 2, explanation: 'n^(log_2 4) = n^2 dominates the linear combine term, so the total is O(n^2).' },
    ],
  },
  {
    id: 'qz-301-3', courseId: 'cs301', title: 'Quiz 3: Graph Fundamentals', week: 6, published: true,
    questions: [
      { id: 'g1', topicId: 't-301-3', text: 'BFS uses which data structure for its frontier?', options: ['Stack', 'Queue', 'Priority queue', 'Hash set'], correct: 1, explanation: 'BFS explores level by level, which is exactly first-in first-out ordering, so it uses a queue.' },
      { id: 'g2', topicId: 't-301-3', text: 'DFS on an adjacency list runs in:', options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'], correct: 2, explanation: 'Every vertex is visited once and every edge relaxed once, giving linear time in V plus E.' },
      { id: 'g3', topicId: 't-301-3', text: 'BFS from source s gives:', options: ['Minimum spanning tree', 'Shortest paths by edge count', 'Topological order', 'Strongly connected components'], correct: 1, explanation: 'BFS visits vertices in nondecreasing distance, so parent pointers encode fewest-edges paths.' },
      { id: 'g4', topicId: 't-301-3', text: 'A directed graph with a cycle cannot have:', options: ['A BFS tree', 'A topological ordering', 'An adjacency matrix', 'Connected components'], correct: 1, explanation: 'Topological order exists only for DAGs. Any cycle breaks the partial order.' },
      { id: 'g5', topicId: 't-301-3', text: 'Number of edges in a complete undirected graph on n vertices:', options: ['n', 'n log n', 'n(n-1)/2', 'n^2'], correct: 2, explanation: 'Every pair of distinct vertices shares one edge: n choose 2 equals n(n-1)/2.' },
      { id: 'g6', topicId: 't-301-3', text: 'Detecting a cycle in an undirected graph with DFS relies on:', options: ['Back edges', 'Cross edges', 'Tree edges only', 'Node degrees'], correct: 0, explanation: 'During undirected DFS, an edge to an already-visited vertex that is not the parent is a back edge, which signals a cycle.' },
      { id: 'g7', topicId: 't-301-5', text: 'Overlapping subproblems, the hallmark of DP, means:', options: ['Subproblems are independent', 'The same subproblem recurs many times', 'The graph has cycles', 'Problems overlap in time'], correct: 1, explanation: 'DP pays off when a naive recursion recomputes the same states repeatedly, and memoisation removes that repetition.' },
      { id: 'g8', topicId: 't-301-5', text: 'Fibonacci by naive recursion is exponential because:', options: ['Numbers grow large', 'fib(k) is recomputed many times', 'Recursion depth is large', 'It uses no memory'], correct: 1, explanation: 'The call tree repeats the same subproblems exponentially often; memoisation reduces it to linear time.' },
      { id: 'g9', topicId: 't-301-3', text: 'Adjacency matrix space cost versus adjacency list for sparse graphs:', options: ['Matrix cheaper', 'List cheaper', 'Equal', 'Depends on V only for both'], correct: 1, explanation: 'Matrix always costs O(V^2) memory; a list costs O(V + E), cheaper when E is far below V^2.' },
      { id: 'g10', topicId: 't-301-1', text: 'Dijkstra with a binary heap runs in:', options: ['O(V^2)', 'O(E log V)', 'O(V + E)', 'O(E^2)'], correct: 1, explanation: 'Each decrease-key and extraction costs O(log V) across E relaxations, giving O(E log V).' },
    ],
  },
  {
    id: 'qz-301-4', courseId: 'cs301', title: 'Quiz 4: Algorithm Complexity', week: 8, published: true,
    questions: [
      { id: 'x1', topicId: 't-301-1', text: 'Amortised analysis of a dynamic array push gives:', options: ['O(n) per push', 'O(1) amortised', 'O(log n) amortised', 'O(n log n) total always'], correct: 1, explanation: 'Doubling spreads the occasional copy cost across all pushes, so each push costs O(1) amortised.' },
      { id: 'x2', topicId: 't-301-1', text: 'Worst case of searching an unbalanced BST of n nodes:', options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'], correct: 1, explanation: 'A degenerate tree is a linked list, so search depth and cost degrade to O(n).' },
      { id: 'x3', topicId: 't-301-1', text: 'T(n) = 2T(n/2) + O(n log n) solves to:', options: ['O(n)', 'O(n log n)', 'O(n log^2 n)', 'O(n^2)'], correct: 2, explanation: 'By the extended Master theorem, each of the log n levels merges with n log n work, giving O(n log^2 n).' },
      { id: 'x4', topicId: 't-301-1', text: 'Which complexity class describes problems solvable in polynomial time?', options: ['NP', 'P', 'NP-hard', 'Undecidable'], correct: 1, explanation: 'P is the class of decision problems solvable in polynomial time by a deterministic machine.' },
      { id: 'x5', topicId: 't-301-1', text: 'If an algorithm is Omega(n^2) it means:', options: ['It never beats n^2 growth upward bound', 'It grows at least as fast as n^2', 'It is exactly n^2', 'It is faster than n^2'], correct: 1, explanation: 'Omega is a lower bound: beyond some n the function is at least c * n^2.' },
      { id: 'x6', topicId: 't-301-1', text: 'Best case of insertion sort:', options: ['O(n) when input is sorted', 'O(n log n) always', 'O(n^2) always', 'O(1)'], correct: 0, explanation: 'On already sorted input, each element needs one comparison and no shifts, so linear time.' },
      { id: 'x7', topicId: 't-301-3', text: 'BFS and DFS both run in O(V + E) because:', options: ['They sort the graph', 'Each vertex and edge is processed a constant number of times', 'They use heaps', 'The graph is sparse'], correct: 1, explanation: 'Both mark each vertex once and scan each adjacency list once, so total work is linear in V plus E.' },
      { id: 'x8', topicId: 't-301-3', text: 'Kosaraju algorithm finds strongly connected components using:', options: ['Two DFS passes', 'BFS levels', 'Dijkstra twice', 'A priority queue'], correct: 0, explanation: 'One DFS records finish order on the graph, a second DFS on the transpose in reverse finish order yields the SCCs.' },
      { id: 'x9', topicId: 't-301-5', text: 'A DP solution must have:', options: ['Optimal substructure and overlapping subproblems', 'Greedy choice property', 'A sorted input', 'No recursion'], correct: 0, explanation: 'Optimal substructure lets you combine subproblem answers, and overlap makes caching them worthwhile.' },
      { id: 'x10', topicId: 't-301-5', text: 'Bottom-up DP versus memoisation differs in:', options: ['Answer correctness', 'Fill order of the table', 'Use of recursion only', 'Asymptotic complexity always'], correct: 1, explanation: 'Both compute the same states; bottom-up fills iteratively in dependency order while memoisation fills lazily by recursion.' },
    ],
  },
  {
    id: 'qz-301-5', courseId: 'cs301', title: 'Quiz 5: Dynamic Programming', week: 10, published: false,
    questions: [
      { id: 'p1', topicId: 't-301-5', text: 'Which problem is solved with 0/1 knapsack style DP?', options: ['Fractional knapsack', '0/1 knapsack maximisation', 'Dijkstra shortest path', 'Merge sort'], correct: 1, explanation: '0/1 knapsack keeps a table over items and remaining capacity; the fractional variant is solved greedily instead.' },
      { id: 'p2', topicId: 't-301-5', text: 'Longest increasing subsequence DP state is:', options: ['dp[i] = LIS ending at index i', 'dp[i] = LIS of first i elements sorted', 'dp[i][j] over pairs only', 'No state is needed'], correct: 0, explanation: 'dp[i] stores the best subsequence that ends exactly at i; transitions scan earlier smaller elements.' },
      { id: 'p3', topicId: 't-301-5', text: 'Memoisation converts top-down recursion into:', options: ['Iteration over a table', 'Caching computed states', 'Branch and bound', 'Randomised search'], correct: 1, explanation: 'A memo table stores each state on first computation and returns the cache on repeat visits.' },
      { id: 'p4', topicId: 't-301-5', text: 'Coin change (minimum coins) with greedy fails when:', options: ['Coins are canonical', 'Coin set is arbitrary, like 1, 3, 4', 'Amount is small', 'Coins are sorted'], correct: 1, explanation: 'For 1, 3, 4 and amount 6 the greedy choice of 4 leads to 4+1+1 while the optimum is 3+3.' },
      { id: 'p5', topicId: 't-301-5', text: 'Time complexity of the classic 0/1 knapsack DP:', options: ['O(n)', 'O(nW)', 'O(n^2)', 'O(W)'], correct: 1, explanation: 'The table has n items by W capacity states, each filled in constant time, so O(nW), pseudo-polynomial.' },
    ],
  },
  {
    id: 'qz-302-2', courseId: 'cs302', title: 'Quiz 2: SQL Queries', week: 5, published: true,
    questions: [
      { id: 's1', topicId: 't-302-2', text: 'Which clause filters groups after aggregation?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correct: 1, explanation: 'WHERE filters rows before grouping; HAVING filters the aggregated groups.' },
      { id: 's2', topicId: 't-302-2', text: 'An INNER JOIN returns:', options: ['All rows of both tables', 'Only matching pairs', 'Left table plus matches', 'Cartesian product'], correct: 1, explanation: 'INNER JOIN keeps only row pairs where the join predicate holds in both tables.' },
      { id: 's3', topicId: 't-302-2', text: 'COUNT(*) versus COUNT(col) differs when:', options: ['Never', 'col contains NULLs', 'Table is empty', 'col is a key'], correct: 1, explanation: 'COUNT(col) skips NULL values while COUNT(*) counts every row.' },
      { id: 's4', topicId: 't-302-2', text: 'A correlated subquery executes:', options: ['Once in total', 'Once per outer row', 'Only with joins', 'Only in views'], correct: 1, explanation: 'A correlated subquery references outer columns, so it is re-evaluated for each candidate outer row.' },
      { id: 's5', topicId: 't-302-2', text: 'DISTINCT removes:', options: ['Duplicate rows in the result', 'NULLs only', 'Indexes', 'Constraints'], correct: 0, explanation: 'DISTINCT deduplicates whole result rows before returning them.' },
      { id: 's6', topicId: 't-302-2', text: 'Best index for WHERE email = ? lookups:', options: ['No index', 'B-tree on email', 'Index on another column', 'Full table scan is fastest'], correct: 1, explanation: 'A B-tree index on the equality column turns a scan into an O(log n) lookup.' },
    ],
  },
]

// Attempts: per student per assessment, list of question ids answered wrong.
// Used for results review, topic mastery and the class confusion heatmap.
export const attempts = [
  // Aarav: q1 7/10, q2 7/10, q3 4/10, q4 3/10  (average 52.5)
  { assessmentId: 'qz-301-1', studentId: 'stu-013', wrong: ['c5', 'c6', 'c8'], score: 7, submittedAt: 'W2 Fri' },
  { assessmentId: 'qz-301-2', studentId: 'stu-013', wrong: ['d5', 'd6', 'd9'], score: 7, submittedAt: 'W4 Fri' },
  { assessmentId: 'qz-301-3', studentId: 'stu-013', wrong: ['g1', 'g2', 'g3', 'g4', 'g6', 'g10'], score: 4, submittedAt: 'W6 Fri' },
  { assessmentId: 'qz-301-4', studentId: 'stu-013', wrong: ['x1', 'x2', 'x3', 'x5', 'x7', 'x8', 'x10'], score: 3, submittedAt: 'W8 Fri' },
  // SQL quiz, unattempted by Aarav (available for the demo flow).

  // Classmates for DAA quizzes. Aggregates feed the confusion heatmap.
  { assessmentId: 'qz-301-1', studentId: 'stu-001', wrong: ['c3', 'c5', 'c8'], score: 7, submittedAt: 'W2 Fri' },
  { assessmentId: 'qz-301-2', studentId: 'stu-001', wrong: ['d3', 'd5', 'd8', 'd9'], score: 6, submittedAt: 'W4 Fri' },
  { assessmentId: 'qz-301-3', studentId: 'stu-001', wrong: ['g4', 'g6', 'g8'], score: 7, submittedAt: 'W6 Fri' },
  { assessmentId: 'qz-301-4', studentId: 'stu-001', wrong: ['x3', 'x5', 'x6', 'x7', 'x9'], score: 5, submittedAt: 'W8 Fri' },
  { assessmentId: 'qz-301-1', studentId: 'stu-002', wrong: ['c2'], score: 9, submittedAt: 'W2 Fri' },
  { assessmentId: 'qz-301-2', studentId: 'stu-002', wrong: ['d8'], score: 9, submittedAt: 'W4 Fri' },
  { assessmentId: 'qz-301-3', studentId: 'stu-002', wrong: ['g6'], score: 9, submittedAt: 'W6 Fri' },
  { assessmentId: 'qz-301-4', studentId: 'stu-002', wrong: ['x3'], score: 9, submittedAt: 'W8 Fri' },
  { assessmentId: 'qz-301-1', studentId: 'stu-003', wrong: ['c4', 'c7'], score: 8, submittedAt: 'W2 Fri' },
  { assessmentId: 'qz-301-2', studentId: 'stu-003', wrong: ['d4', 'd10'], score: 8, submittedAt: 'W4 Fri' },
  { assessmentId: 'qz-301-3', studentId: 'stu-003', wrong: ['g2', 'g5'], score: 8, submittedAt: 'W6 Fri' },
  { assessmentId: 'qz-301-4', studentId: 'stu-003', wrong: ['x4', 'x10'], score: 8, submittedAt: 'W8 Fri' },
  { assessmentId: 'qz-301-1', studentId: 'stu-004', wrong: ['c1', 'c3', 'c6', 'c8', 'c9'], score: 5, submittedAt: 'W2 Fri' },
  { assessmentId: 'qz-301-2', studentId: 'stu-004', wrong: ['d2', 'd5', 'd6', 'd7', 'd10'], score: 5, submittedAt: 'W4 Fri' },
  { assessmentId: 'qz-301-3', studentId: 'stu-004', wrong: ['g2', 'g3', 'g5', 'g6', 'g9'], score: 5, submittedAt: 'W6 Fri' },
  { assessmentId: 'qz-301-4', studentId: 'stu-004', wrong: ['x1', 'x2', 'x3', 'x6', 'x8'], score: 5, submittedAt: 'W8 Fri' },
  { assessmentId: 'qz-301-1', studentId: 'stu-005', wrong: ['c5'], score: 9, submittedAt: 'W2 Fri' },
  { assessmentId: 'qz-301-2', studentId: 'stu-005', wrong: ['d9', 'd10'], score: 8, submittedAt: 'W4 Fri' },
  { assessmentId: 'qz-301-3', studentId: 'stu-005', wrong: ['g8'], score: 9, submittedAt: 'W6 Fri' },
  { assessmentId: 'qz-301-4', studentId: 'stu-005', wrong: ['x2', 'x6'], score: 8, submittedAt: 'W8 Fri' },
  { assessmentId: 'qz-301-1', studentId: 'stu-006', wrong: ['c2', 'c5', 'c6'], score: 7, submittedAt: 'W2 Fri' },
  { assessmentId: 'qz-301-2', studentId: 'stu-006', wrong: ['d3', 'd5'], score: 8, submittedAt: 'W4 Fri' },
  { assessmentId: 'qz-301-3', studentId: 'stu-006', wrong: ['g1', 'g3', 'g6'], score: 7, submittedAt: 'W6 Fri' },
  { assessmentId: 'qz-301-4', studentId: 'stu-006', wrong: ['x5', 'x9'], score: 8, submittedAt: 'W8 Fri' },
  { assessmentId: 'qz-301-1', studentId: 'stu-007', wrong: ['c8'], score: 9, submittedAt: 'W2 Fri' },
  { assessmentId: 'qz-301-2', studentId: 'stu-007', wrong: ['d1'], score: 9, submittedAt: 'W4 Fri' },
  { assessmentId: 'qz-301-3', studentId: 'stu-007', wrong: ['g5'], score: 9, submittedAt: 'W6 Fri' },
  { assessmentId: 'qz-301-4', studentId: 'stu-007', wrong: ['x7'], score: 9, submittedAt: 'W8 Fri' },
  { assessmentId: 'qz-301-1', studentId: 'stu-008', wrong: ['c3', 'c9'], score: 8, submittedAt: 'W2 Fri' },
  { assessmentId: 'qz-301-2', studentId: 'stu-008', wrong: ['d4'], score: 9, submittedAt: 'W4 Fri' },
  { assessmentId: 'qz-301-3', studentId: 'stu-008', wrong: ['g2', 'g9'], score: 8, submittedAt: 'W6 Fri' },
  { assessmentId: 'qz-301-4', studentId: 'stu-008', wrong: ['x1', 'x8'], score: 8, submittedAt: 'W8 Fri' },
  // SQL quiz attempts (cs302) for cross-course heatmap and dean analytics.
  { assessmentId: 'qz-302-2', studentId: 'stu-001', wrong: ['s4'], score: 5, submittedAt: 'W5 Fri' },
  { assessmentId: 'qz-302-2', studentId: 'stu-002', wrong: [], score: 6, submittedAt: 'W5 Fri' },
  { assessmentId: 'qz-302-2', studentId: 'stu-003', wrong: ['s3', 's4'], score: 4, submittedAt: 'W5 Fri' },
  { assessmentId: 'qz-302-2', studentId: 'stu-005', wrong: ['s4'], score: 5, submittedAt: 'W5 Fri' },
]

// Hand-authored aggregate stats for classmates so faculty and dean views are
// consistent without simulating every raw submission. Demo student stats are
// computed from the real records above.
export const classmateStats = {
  'stu-001': { lateStreak: 2, engagementDeclining: true, pendingUrgent: true, weakTopics: ['t-301-5'] },
  'stu-002': { lateStreak: 0, engagementDeclining: false, pendingUrgent: false, weakTopics: [] },
  'stu-003': { lateStreak: 0, engagementDeclining: false, pendingUrgent: false, weakTopics: [] },
  'stu-004': { lateStreak: 3, engagementDeclining: true, pendingUrgent: true, weakTopics: ['t-301-1', 't-301-5'] },
  'stu-005': { lateStreak: 0, engagementDeclining: false, pendingUrgent: false, weakTopics: [] },
  'stu-006': { lateStreak: 1, engagementDeclining: false, pendingUrgent: false, weakTopics: ['t-301-3'] },
  'stu-007': { lateStreak: 0, engagementDeclining: false, pendingUrgent: false, weakTopics: [] },
  'stu-008': { lateStreak: 0, engagementDeclining: false, pendingUrgent: false, weakTopics: [] },
}

export const announcements = [
  { id: 'an-01', courseId: 'cs301', authorId: 'fac-01', date: 'W8 Mon', title: 'Quiz 5 on Dynamic Programming next Friday', body: 'Quiz 5 covers memoisation, bottom-up tables and the knapsack family. Review the Memoization micro-module and the problem ladder before Friday.' },
  { id: 'an-02', courseId: 'cs301', authorId: 'fac-01', date: 'W7 Mon', title: 'Assignment 5 released', body: 'Dynamic Programming Assignment is now open. It is due in two days. Late submissions will be recorded and reflected in your engagement indicators.' },
  { id: 'an-03', courseId: 'cs302', authorId: 'fac-02', date: 'W6 Wed', title: 'Lab slot change for next week', body: 'The Wednesday DBMS lab moves to Thursday 2 pm in Lab 204 because of a workshop. Attendance carries over.' },
]

// Aggregate confusion data per course and topic across all evaluated attempts,
// hand-tuned to agree with the attempt records above.
export const confusion = {
  cs301: {
    't-301-1': { responses: 57, incorrectPct: 32 },
    't-301-2': { responses: 57, incorrectPct: 26 },
    't-301-3': { responses: 57, incorrectPct: 61 },
    't-301-4': { responses: 28, incorrectPct: 44 },
    't-301-5': { responses: 47, incorrectPct: 68 },
  },
  cs302: {
    't-302-2': { responses: 24, incorrectPct: 25 },
  },
  cs303: {},
  cs304: {},
}

// Engagement: resource views per week for the demo student (DAA declining).
export const engagementWeeks = ['W3', 'W4', 'W5', 'W6', 'W7', 'W8']
export const engagementViews = { cs301: [14, 12, 9, 7, 5, 3], cs302: [10, 9, 11, 10, 9, 10], cs303: [8, 9, 8, 9, 10, 9], cs304: [7, 8, 8, 7, 8, 8] }

// Dean-level course aggregates.
export const deanCourseStats = {
  cs301: { avgScore: 63, submissionRate: 88, riskHigh: 2, riskMedium: 2, riskLow: 5, trend: [68, 66, 61, 58] },
  cs302: { avgScore: 74, submissionRate: 95, riskHigh: 0, riskMedium: 1, riskLow: 7, trend: [72, 73, 75, 74] },
  cs303: { avgScore: 70, submissionRate: 91, riskHigh: 0, riskMedium: 1, riskLow: 6, trend: [69, 70, 71, 70] },
  cs304: { avgScore: 71, submissionRate: 89, riskHigh: 0, riskMedium: 1, riskLow: 6, trend: [70, 72, 71, 71] },
  cs305: { avgScore: 76, submissionRate: 97, riskHigh: 0, riskMedium: 0, riskLow: 3, trend: [75, 76, 77, 76] },
}
