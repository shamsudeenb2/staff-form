"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { Filter, RefreshCcw, Users, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------

type UserRow = {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  rank: string;
  gradeLevel: string;
  station: string;
  done: boolean; // final submission status
  createdAt: string; // ISO
};

// payload returned from an API (you can replace with your live endpoint)
type DashboardPayload = {
  users: UserRow[];
  stations: string[]; // optional convenience arrays. We also derive from users if absent
  gradeLevels: string[];
};

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------

const isBrowser = () => typeof window !== "undefined";

function groupCount<T, K extends string | number>(arr: T[], by: (t: T) => K) {
  const map = new Map<K, number>();
  for (const item of arr) {
    const k = by(item);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return Array.from(map.entries()).map(([k, v]) => ({ key: String(k), value: v }));
}

function toWeekKey(iso: string) {
  const d = new Date(iso);
  // normalize to Monday-based week key YYYY-WW
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7; // 1..7 (Mon..Sun)
  if (dayNum !== 1) date.setUTCDate(date.getUTCDate() - (dayNum - 1));
  const year = date.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const diff = (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const week = Math.ceil((diff + start.getUTCDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function mkFakeData(count = 120): DashboardPayload {
  const stations = [
    "HQ Abuja",
    "Lagos GPO",
    "Kano",
    "Port Harcourt",
    "Ibadan",
    "Kaduna",
  ];
  const gradeLevels = ["GL07", "GL08", "GL09", "GL10", "GL12", "GL14"];
  const ranks = ["Officer", "Senior Officer", "Principal Officer", "Assistant Manager", "Manager"];

  const users: UserRow[] = Array.from({ length: count }).map((_, i) => {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const gradeLevel = gradeLevels[Math.floor(Math.random() * gradeLevels.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    const gender = Math.random() > 0.47 ? "MALE" : "FEMALE";
    const done = Math.random() > 0.58 ? false : true;
    const createdAt = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 120).toISOString();
    return {
      id: `u_${i + 1}`,
      name: `User ${i + 1}`,
      gender,
      rank,
      gradeLevel,
      station,
      done,
      createdAt,
    };
  });

  return { users, stations, gradeLevels };
}

async function fetchDashboard(): Promise<DashboardPayload> {
  try {
    const res = await fetch("/api/admin/dashboard");
    if (!res.ok) throw new Error("Network error");
    const data = (await res.json()) as DashboardPayload;
    // fallback derivations if the API omits station/grade arrays
    const stations = data.stations?.length
      ? data.stations
      : Array.from(new Set(data.users.map((u) => u.station))).sort();
    const gradeLevels = data.gradeLevels?.length
      ? data.gradeLevels
      : Array.from(new Set(data.users.map((u) => u.gradeLevel))).sort();
    return { ...data, stations, gradeLevels };
  } catch {
    // local mock to keep the page functional without a backend
    return mkFakeData();
  }
}

// -------------------------------------------------------------
// Page Component
// -------------------------------------------------------------

export default function AdminDashboard() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<string>("ALL");
  const [grade, setGrade] = useState<string>("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchDashboard();
      if (!mounted) return;
      setPayload(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // options for slicers
  const stations = useMemo(() => payload?.stations ?? [], [payload]);
  const gradeLevels = useMemo(() => payload?.gradeLevels ?? [], [payload]);

  const filteredUsers = useMemo(() => {
    if (!payload) return [] as UserRow[];
    return payload.users
      .filter((u) => (station === "ALL" ? true : u.station === station))
      .filter((u) => (grade === "ALL" ? true : u.gradeLevel === grade))
      .filter((u) => (q.trim() ? u.name.toLowerCase().includes(q.trim().toLowerCase()) : true));
  }, [payload, station, grade, q]);

  const complete = filteredUsers.filter((u) => u.done).length;
  const incomplete = filteredUsers.length - complete;

  // bar: distribution of users *by station* for the selected grade level
  const barData = useMemo(() => {
    const base = payload?.users.filter((u) => (grade === "ALL" ? true : u.gradeLevel === grade)) || [];
    const grouped = groupCount(base, (u) => u.station);
    return grouped.map((x) => ({ station: x.key, users: x.value }));
  }, [payload, grade]);

  // pie: male vs female for current filters (station + grade)
  const pieData = useMemo(() => {
    const base = filteredUsers;
    const male = base.filter((u) => u.gender === "MALE").length;
    const female = base.filter((u) => u.gender === "FEMALE").length;
    const other = base.filter((u) => u.gender !== "MALE" && u.gender !== "FEMALE").length;
    return [
      { name: "Male", value: male },
      { name: "Female", value: female },
      ...(other ? [{ name: "Other", value: other }] : []),
    ];
  }, [filteredUsers]);

  // trend: submissions (done=true) over time, filtered
  const lineData = useMemo(() => {
    const base = filteredUsers.filter((u) => u.done);
    const grouped = groupCount(base, (u) => toWeekKey(u.createdAt));
    return grouped
      .map((g) => ({ week: g.key, submissions: g.value }))
      .sort((a, b) => (a.week < b.week ? -1 : 1));
  }, [filteredUsers]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"]; // Tailwind palette hues

  return (
    <DashboardLayout>
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setStation("ALL"); setGrade("ALL"); setQ(""); }}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </div>

        {/* Top Row: Slicers */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Station</label>
                  <Select value={station} onValueChange={setStation}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Stations</SelectItem>
                      {stations.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Grade Level</label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Grades</SelectItem>
                      {gradeLevels.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Search by name</label>
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name…" className="mt-1" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Second Row: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Users (filtered)</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-3">
              <Users className="w-10 h-10" />
              <div>
                <div className="text-3xl font-bold">{loading ? "—" : filteredUsers.length}</div>
                <div className="text-xs text-muted-foreground">Based on current filters</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Completed Submissions</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
              <div>
                <div className="text-3xl font-bold">{loading ? "—" : complete}</div>
                <div className="text-xs text-muted-foreground">Users with done = true</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending / Incomplete</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-3">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
              <div>
                <div className="text-3xl font-bold">{loading ? "—" : incomplete}</div>
                <div className="text-xs text-muted-foreground">Users yet to submit</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row: Table + Bar chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground">No users match current filters.</div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <div className="max-h-[420px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Rank</th>
                          <th className="text-left p-3">Grade</th>
                          <th className="text-left p-3">Station</th>
                          <th className="text-left p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="border-t">
                            <td className="p-3">
                              <Link href={`/register/personal?userId=${u.id}`} className="text-primary hover:underline">
                                {u.name}
                              </Link>
                            </td>
                            <td className="p-3">{u.rank}</td>
                            <td className="p-3">{u.gradeLevel}</td>
                            <td className="p-3">{u.station}</td>
                            <td className="p-3">
                              {u.done ? (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Complete</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Users per Station (by selected Grade)</CardTitle>
            </CardHeader>
            <CardContent className="h-[420px]">
              {loading ? (
                <Skeleton className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <XAxis dataKey="station" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" name="Users" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row: Pie (Gender) + Trend Line */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle>Gender Distribution</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              {loading ? (
                <Skeleton className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Submissions Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {loading ? (
                <Skeleton className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} interval={Math.ceil(lineData.length / 8)} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="submissions" name="Final submissions" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bonus: Tiny insights */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Stations by Users</CardTitle></CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  {groupCount(filteredUsers, (u) => u.station)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((x) => (
                      <li key={x.key} className="flex items-center justify-between">
                        <span>{x.key}</span>
                        <Badge variant="secondary">{x.value}</Badge>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Grades by Users</CardTitle></CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  {groupCount(filteredUsers, (u) => u.gradeLevel)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((x) => (
                      <li key={x.key} className="flex items-center justify-between">
                        <span>{x.key}</span>
                        <Badge variant="secondary">{x.value}</Badge>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Completion Rate</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {filteredUsers.length ? Math.round((complete / filteredUsers.length) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">of filtered users have completed submission</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
    </DashboardLayout>
  );
}


// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge";
// import {
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
// } from "recharts";

// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState<any>(null);
//   const [selectedStation, setSelectedStation] = useState<string | null>(null);
//   const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const res = await fetch("/api/admin/dashboard");
//         if (!res.ok) throw new Error("Failed to fetch dashboard data");
//         const json = await res.json();
//         setData(json);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-6 space-y-4">
//         <Skeleton className="h-10 w-[200px]" />
//         <Skeleton className="h-24 w-full" />
//         <Skeleton className="h-64 w-full" />
//       </div>
//     );
//   }

//   if (!data) {
//     return <div className="p-6">Failed to load dashboard data.</div>;
//   }

//   // filter data by slicers
//   const filteredUsers = data.users.filter((u: any) => {
//     return (
//       (!selectedStation || u.station === selectedStation) &&
//       (!selectedGrade || u.rank === selectedGrade)
//     );
//   });

//   const stations = [...new Set(data.users.map((u: any) => u.station))];
//   const grades = [...new Set(data.users.map((u: any) => u.rank))];

//   const completeSubmissions = filteredUsers.filter(
//     (u: any) => u.done
//   ).length;
//   const incompleteSubmissions = filteredUsers.length - completeSubmissions;

//   // distribution by station and rank
//   const stationDistribution = stations.map((station) => {
//     return {
//       station,
//       count: filteredUsers.filter((u: any) => u.station === station).length,
//     };
//   });

//   // gender distribution
//   const genderDistribution = [
//     {
//       name: "Male",
//       value: filteredUsers.filter((u: any) => u.gender === "Male").length,
//     },
//     {
//       name: "Female",
//       value: filteredUsers.filter((u: any) => u.gender === "Female").length,
//     },
//   ];

//   return (
//     <div className="p-6 space-y-6">
//       {/* slicers row */}
//       <div className="grid grid-cols-2 gap-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Filter by Station</CardTitle>
//           </CardHeader>
//           <CardContent className="flex flex-wrap gap-2">
//             {stations.map((station) => (
//               <Badge
//                 key={station}
//                 variant={selectedStation === station ? "default" : "outline"}
//                 onClick={() =>
//                   setSelectedStation(
//                     selectedStation === station ? null : station
//                   )
//                 }
//                 className="cursor-pointer"
//               >
//                 {station}
//               </Badge>
//             ))}
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Filter by Grade</CardTitle>
//           </CardHeader>
//           <CardContent className="flex flex-wrap gap-2">
//             {grades.map((grade) => (
//               <Badge
//                 key={grade}
//                 variant={selectedGrade === grade ? "default" : "outline"}
//                 onClick={() =>
//                   setSelectedGrade(selectedGrade === grade ? null : grade)
//                 }
//                 className="cursor-pointer"
//               >
//                 {grade}
//               </Badge>
//             ))}
//           </CardContent>
//         </Card>
//       </div>

//       <Separator />

//       {/* cards row */}
//       <div className="grid grid-cols-2 gap-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Complete Submissions</CardTitle>
//           </CardHeader>
//           <CardContent className="text-3xl font-bold">
//             {completeSubmissions}
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Incomplete Submissions</CardTitle>
//           </CardHeader>
//           <CardContent className="text-3xl font-bold">
//             {incompleteSubmissions}
//           </CardContent>
//         </Card>
//       </div>

//       <Separator />

//       {/* users table + bar chart */}
//       <div className="grid grid-cols-3 gap-4">
//         <Card className="col-span-2">
//           <CardHeader>
//             <CardTitle>Users</CardTitle>
//           </CardHeader>
//           <ScrollArea className="h-72">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left">
//                   <th className="p-2">Name</th>
//                   <th className="p-2">Rank</th>
//                   <th className="p-2">Station</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.map((user: any) => (
//                   <tr key={user.id} className="border-t">
//                     <td className="p-2">
//                       <a
//                         href={`/admin/users/${user.id}`}
//                         className="text-blue-600 hover:underline"
//                       >
//                         {user.name}
//                       </a>
//                     </td>
//                     <td className="p-2">{user.rank}</td>
//                     <td className="p-2">{user.station}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </ScrollArea>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Station Distribution</CardTitle>
//           </CardHeader>
//           <CardContent className="h-72">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={stationDistribution}>
//                 <XAxis dataKey="station" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="count" fill="#8884d8" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       <Separator />

//       {/* gender pie chart */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Gender Distribution</CardTitle>
//         </CardHeader>
//         <CardContent className="h-72">
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <Pie
//                 data={genderDistribution}
//                 dataKey="value"
//                 nameKey="name"
//                 outerRadius={100}
//                 label
//               >
//                 {genderDistribution.map((entry, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={index === 0 ? "#8884d8" : "#82ca9d"}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
