// // app/api/admin/dashboard/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/components/lib/db";
// import {getRetirementTimeLeft} from "@/components/hooks/retirementCal";

// /**
//  * GET /api/admin/dashboard
//  *
//  * Returns a dashboard payload with:
//  * - users[]: { id, name, gender, rank, gradeLevel, station, done, createdAt }
//  * - stations[]: unique station list
//  * - gradeLevels[]: unique grade list
//  * - meta counts: totals, completed, incomplete
//  * - countsByStation, countsByGrade, genderCounts
//  * - weeklySubmissions (simple week-key -> count for done=true)
//  *
//  * Optional query params:
//  * - station=Station Name (filters users to that station)
//  * - grade=GLxx (filters users by grade)
//  * - limit=number (limit returned users, default 1000)
//  *
//  * NOTE: this derives `done` (completed submission) if there's a filled personalData
//  * + employmentData + at least one education history. If you have a `done` flag
//  * on the User model, you can update the selection below to use it directly.
//  */

// function groupCount<T>(arr: T[], by: (t: T) => string) {
//   const m = new Map<string, number>();
//   for (const item of arr) {
//     const k = by(item) ?? "Unknown";
//     m.set(k, (m.get(k) ?? 0) + 1);
//   }
//   return Array.from(m.entries()).map(([key, value]) => ({ key, value }));
// }

// function toWeekKey(iso: string) {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return "invalid";
//   // ISO week-like key: YYYY-Www (simple Monday-based calculation)
//   const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
//   const day = date.getUTCDay() || 7;
//   date.setUTCDate(date.getUTCDate() - (day - 1)); // move to Monday
//   const year = date.getUTCFullYear();
//   const start = new Date(Date.UTC(year, 0, 1));
//   const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
//   const week = Math.ceil((diffDays + start.getUTCDay() + 1) / 7);
//   return `${year}-W${String(week).padStart(2, "0")}`;
// }

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const stationFilter = url.searchParams.get("station");
//     const gradeFilter = url.searchParams.get("grade");
//     const limitParam = parseInt(url.searchParams.get("limit") || "1000", 10);
//     const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 5000) : 1000;

//     // Build where clause for Prisma based on possible related filters
//     const where: any = {};
//     const employmentWhere: any = {};
//     if (stationFilter && stationFilter !== "ALL") employmentWhere.presentStation = stationFilter;
//     if (gradeFilter && gradeFilter !== "ALL") employmentWhere.gradeLevel = gradeFilter;
//     if (Object.keys(employmentWhere).length > 0) {
//       where.employmentData = { is: employmentWhere };
//     }

//     // Select core pieces we need to build the payload
//     // NOTE: adjust include/select keys if your schema uses different field names
//     const usersRaw = await prisma.user.findMany({
//       where,
//       select: {
//         id: true,
//         phone: true,
//         email: true,
//         createdAt: true,
//         done:true,
//         // personalData relation (may be null)
//         personalData: {
//           select: { firstName: true, dob:true, lastName: true, gender: true },
//         },
//         // employmentData relation (may be null)
//         employmentData: {
//           select: { 
//             rank: true, dateFirstAppointed:true, gradeLevel: true, presentStation: true,
//             standardStation:{
//               select:{name:true}
//             }
//           },
//         },
//         // education histories (array)
//         educationHistory: {
//           select: { id: true },
//         },
//       },
//       orderBy: { createdAt: "desc" },
      
//     });

//     // Map into the shape the dashboard UI expects
//     const users = usersRaw.map((u) => {
//       const firstName = u.personalData?.firstName ?? "";
//       const lastName = u.personalData?.lastName ?? "";
//       const name = `${firstName} ${lastName}`.trim() || u.email || u.phone || "Unknown";
//       const gender = (u.personalData?.gender as string) ?? "OTHER";
//       const rank = u.employmentData?.rank ?? "—";
//       const gradeLevel = u.employmentData?.gradeLevel ?? "—";
//       const station = u.employmentData?.presentStation ?? "—";
//       const standardStation = u.employmentData?.standardStation?.name ?? "—";
//       const timeLeft = getRetirementTimeLeft(u.personalData?.dob as Date, u.employmentData?.dateFirstAppointed as Date) ?? "—";
//       // derive completed 'done' flag: adjust logic here if you store a dedicated flag
//       const done = u.done
//         // !!u.personalData && !!u.employmentData && Array.isArray(u.educationHistory) && u.educationHistory.length > 0;

//       return {
//         id: u.id,
//         name,
//         gender,
//         rank,
//         gradeLevel,
//         station,
//         standardStation,
//         done,
//         timeLeft,
//         createdAt: u.createdAt.toISOString(),
//       };
//     });

//     // Build meta arrays (unique stations & grades)
//     const stationSet = new Set<string>();
//     const gradeSet = new Set<string>();
//     for (const u of users) {
//       if (u.standardStation) stationSet.add(u.standardStation);
//       if (u.gradeLevel) gradeSet.add(u.gradeLevel);
//     }
//     const stations = Array.from(stationSet).sort();
//     const gradeLevels = Array.from(gradeSet).sort();

//     // Derived metrics used by the client
//     const total = users.length;
//     const completed = users.filter((u) => u.done).length;
//     const incomplete = total - completed;

//     const countsByStation = groupCount(users, (u) => u.standardStation).sort((a, b) => b.value - a.value);
//     const countsByGrade = groupCount(users, (u) => u.gradeLevel).sort((a, b) => b.value - a.value);
//     const genderCounts = groupCount(users, (u) => u.gender);

//     // weekly submissions (done=true)
//     const weekly = groupCount(
//       users.filter((u) => u.done),
//       (u) => toWeekKey(u.createdAt)
//     )
//       .map((g) => ({ week: g.key, submissions: g.value }))
//       .sort((a, b) => (a.week < b.week ? -1 : 1));

//     const payload = {
//       users,
//       stations,
//       gradeLevels,
//       meta: { total, completed, incomplete },
//       countsByStation,
//       countsByGrade,
//       genderCounts,
//       weeklySubmissions: weekly,
//     };

//     return NextResponse.json(payload, { status: 200 });
//   } catch (err) {
//     console.error("Error in /api/admin/dashboard:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/db";
import { getRetirementTimeLeft } from "@/components/hooks/retirementCal";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stationFilter = searchParams.get("station");
    const gradeFilter = searchParams.get("grade");
    const searchQ = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // 1. Build the Filter (Where Clause)
    const where: any = {
      AND: [
        // Name search (Search across First and Last name)
        searchQ ? {
          personalData: {
            OR: [
              { firstName: { contains: searchQ, mode: 'insensitive' } },
              { lastName: { contains: searchQ, mode: 'insensitive' } },
            ]
          }
        } : {},
        // Station Filter
        stationFilter && stationFilter !== "ALL" ? {
          employmentData: { standardStation: { name: stationFilter } }
        } : {},
        // Grade Filter
        gradeFilter && gradeFilter !== "ALL" ? {
          employmentData: { gradeLevel: gradeFilter }
        } : {},
      ]
    };

    // 2. Fetch Aggregated Data for Charts & Stats (Fast)
    // We fetch basic info for all users matching filters to build charts
    const allMatchingUsers = await prisma.user.findMany({
      where,
      select: {
        done: true,
        personalData: { select: { gender: true } },
        employmentData: { 
          select: { 
            gradeLevel: true, 
            standardStation: { select: { name: true } } 
          } 
        },
        createdAt: true
      }
    });

    // 3. Fetch Paginated Users for the Table (Efficient)
    const usersRaw = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        phone: true,
        email: true,
        createdAt: true,
        done: true,
        personalData: { select: { firstName: true, lastName: true, gender: true, dob: true } },
        employmentData: {
          select: {
            rank: true,
            gradeLevel: true,
            dateFirstAppointed: true,
            presentStation:true,
            standardStation: { select: { name: true } }
          }
        }
      }
    });

    // 4. Fetch Global Lists (Dropdowns) - Only do this once or cache it
    const uniqueStations = await prisma.standardStation.findMany({ select: { name: true } });
    const uniqueGrades = await prisma.employmentData.findMany({ 
        distinct: ['gradeLevel'], 
        select: { gradeLevel: true }
    });

    // 5. Processing for Frontend
    const totalMatching = allMatchingUsers.length;
    const completed = allMatchingUsers.filter(u => u.done).length;

    const formattedUsers = usersRaw.map((u) => ({
      id: u.id,
      name: `${u.personalData?.firstName || ""} ${u.personalData?.lastName || ""}`.trim() || u.email || "Unknown",
      rank: u.employmentData?.rank || "—",
      gradeLevel: u.employmentData?.gradeLevel || "—",
      standardStation: u.employmentData?.standardStation?.name || "—",
      presentStation: u.employmentData?.presentStation || "—",
      done: u.done,
      timeLeft: getRetirementTimeLeft(u.personalData?.dob as Date, u.employmentData?.dateFirstAppointed as Date) || "—",
      createdAt: u.createdAt.toISOString()
    }));

    return NextResponse.json({
      users: formattedUsers,
      stations: uniqueStations.map(s => s.name).sort(),
      gradeLevels: uniqueGrades.map(g => g.gradeLevel).sort(),
      pagination: {
        total: totalMatching,
        pages: Math.ceil(totalMatching / limit),
        currentPage: page
      },
      stats: {
        total: totalMatching,
        completed,
        pending: totalMatching - completed
      },
      // Note: In a real production app, you'd calculate these chart arrays here 
      // instead of sending allMatchingUsers, but 5,000 records of just strings is fine.
      chartRaw: allMatchingUsers.map(u => ({
        gender: u.personalData?.gender,
        station: u.employmentData?.standardStation?.name,
        grade: u.employmentData?.gradeLevel,
        done: u.done,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}