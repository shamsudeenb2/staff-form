// app/api/submissions/submit/route.ts
import {NextRequest, NextResponse } from "next/server";
import  prisma  from "@/components/lib/db";
import  submitStatus  from "@/components/lib/db";

import { z } from "zod";
import { computeDiff } from "@/components/lib/submission-utils";
import { getSession } from "@/app/config/auth";
import { SubmissionStatus } from "@prisma/client";

// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // edit to match

const BodySchema = z.object({
  action: z.enum(["save", "finalize"]).default("save"),
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
  dataList: z.any(),
  activePage: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.parse(body);

    console.log("name console date",parsed.dataList, body)
    // identify user: prefer session, fallback to phone lookup
    let userId: string | null = null;
    const session = await getSession(); // uncomment/adapt to your app
    if(!session) return NextResponse.json({ error: "auth required (no session )" }, { status: 401 });

    userId = session?.user?.id;
    


    // if (!userId) {
    //   // phone fallback (works for OTP flow)
    //   if (!parsed.phone) return NextResponse.json({ error: "auth required (no session and no phone provided)" }, { status: 401 });
    //   const user = await prisma.user.findUnique({ where: { phone: parsed.phone } });
    //   if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });
    //   userId = user.id;
    // }

    // get window
    const window = await prisma.submissionWindow.findUnique({ where: { yearMonth: parsed.yearMonth } });
    if (!window || !window.isOpen) {
      return NextResponse.json({ error: "Submission window closed for this month" }, { status: 403 });
    }

    // find existing (unique per userId + yearMonth)
    const uniqueWhere = { userId_yearMonth: { userId, yearMonth: parsed.yearMonth } };
    const existing = await prisma.monthlySubmission.findUnique({ where: uniqueWhere });

    if (parsed.action === "save") {
      // create or update a DRAFT
      const now = new Date();
      const result = existing
        ? await prisma.monthlySubmission.update({
            where: uniqueWhere,
            data: { data: parsed.dataList, updatedAt: now, status: "DRAFT" },
          })
        : await prisma.monthlySubmission.create({
            data: {
              userId,
              yearMonth: parsed.yearMonth,
              data: parsed.dataList,
              status: "DRAFT",
              createdBy: userId,
            },
          });
      return NextResponse.json({ success: true, id: result.id });
    }

    // finalize: check previous FINAL (latest final before now)
    // find latest FINAL for this user (createdAt < now) — this will be "previous"
    const previous = await prisma.monthlySubmission.findFirst({
      where: { userId, status: "FINAL" },
      orderBy: { createdAt: "desc" },
    });

    const diff = computeDiff(previous?.data ?? {}, parsed.dataList);
      
    if(parsed?.dataList?.education){
      const education = await prisma.educationHistory.update({
        where: { userId:userId  },
        data:{
        addQualification: {
          create: parsed?.dataList?.education?.additionalQualifications?.map((aq: any) => ({
            qualification: aq.qualification,
            institution: aq.institution,
            type:"ADDITIONAL",
            startDate: aq.start,
            endDate: aq.end
          }))
        },
      }
      })
      console.log("education data",education)
    }
    //   const result = existing
    //       ? await prisma.monthlySubmission.update({
    //           where: uniqueWhere,
    //           data: {
    //             data: parsed.dataList,
    //             status: "FINAL",
    //             diff,
    //             previousSubmissionId: previous?.id ?? null,
    //             createdBy: userId,
    //           },
    //         })
    //       : await prisma.monthlySubmission.create({
    //           data: {
    //             userId,
    //             yearMonth: parsed.yearMonth,
    //             data: parsed.dataList,
    //             status: "FINAL",
    //             diff,
    //             previousSubmissionId: previous?.id ?? null,
    //             createdBy: userId,
    //           },
    //         });

    //       return NextResponse.json({ success: true, id: result.id, diffSummary: { added: Object.keys(diff.added).length, changed: Object.keys(diff.changed).length, removed: Object.keys(diff.removed).length } });

    // }else if(parsed.activePage==="employment"){

    if(parsed?.dataList?.employment){
         const employ =await prisma.employmentData.update({
        where: { userId:userId  },
        data:{
          previousStations: {
          create: parsed?.dataList?.employment?.previousStations?.map((ps:any) => ({
            station: ps.station,
            yearsInStation: ps.yearsInStation,
          })),
        },
        previousJobsHandled: {
          create: parsed?.dataList?.employment?.previousJobsHandled?.map((pj:any) => ({
            job: pj.job,
            yearsInJob: pj.yearsInJob,
            jobDescription: pj.jobDescription,
          })),
        },
        previousPromotion: {
          create: parsed?.dataList?.employment?.previousPromotion?.map((pj:any) => ({
            rank: pj.rank,
            gradeLevel: pj.gradeLevel,
            date: pj.date,
          })),
        },
        }
        })
        console.log("employment data",employ)
    }
    //       const result = existing
    //       ? await prisma.monthlySubmission.update({
    //           where: uniqueWhere,
    //           data: {
    //             data: parsed.dataList,
    //             status: "FINAL",
    //             diff,
    //             previousSubmissionId: previous?.id ?? null,
    //             createdBy: userId,
    //           },
    //         })
    //       : await prisma.monthlySubmission.create({
    //           data: {
    //             userId,
    //             yearMonth: parsed.yearMonth,
    //             data: parsed.dataList,
    //             status: "FINAL",
    //             diff,
    //             previousSubmissionId: previous?.id ?? null,
    //             createdBy: userId,
    //           },
    //         });

    //       return NextResponse.json({ success: true, id: result.id, diffSummary: { added: Object.keys(diff.added).length, changed: Object.keys(diff.changed).length, removed: Object.keys(diff.removed).length } });

    if(parsed?.dataList?.orthers){
      const formData = await req.formData();
      const phone = formData.get(`phone`) as string;
       const certificates: any[] = [];
          let index = 0;
          while (formData.has(`certificates[${index}][title]`)) {
            const title = formData.get(`certificates[${index}][title]`) as string;
            const dateIssued = formData.get(`certificates[${index}][dateIssued]`) as string;
            const skills = formData.get(`certificates[${index}][skills]`) as string;
            const file = formData.get(`certificates[${index}][fileUrl]`) as File | null;
      
            let fname
            // TODO: save file somewhere (S3, Cloudinary, local disk, etc.)
              if (`certificates[${index}][fileUrl]`.endsWith("[fileUrl]") && file instanceof File) {
               fname = `certs/${phone}/${Date.now()}-${file.name}`;
              const buf = Buffer.from(await file.arrayBuffer());
              // const { error } = await supabase.storage.from("docs").upload(fname, buf, {
              //   contentType: file.type || "application/pdf",
              //   upsert: false,
              // });
              // if (error) throw error;
              // uploads.push(fname);
            }
            // let filePath = null;
            // if (file) {
            //   const arrayBuffer = await file.arrayBuffer();
            //   const buffer = Buffer.from(arrayBuffer);
            //   // Example: save to local `uploads/`
            //   const fs = require("fs");
            //   const path = `./uploads/${file.name}`;
            //   fs.writeFileSync(path, buffer);
            //   filePath = path;
            // }
      
            certificates.push({ title, dateIssued, skills, fname });
            index++;
          }
      
          // Save to database as JSON in OtherData.content
          const other = await prisma.otherData.upsert({
            where: { userId: userId }, // <- use session/auth to get userId
            update: { content: certificates },
            create: {
              userId: userId,
              content: certificates,
            },
          });
          console.log("others data", other)
        } 
        const result = existing

          ? await prisma.monthlySubmission.update({
              where: uniqueWhere,
              data: {
                data: parsed.dataList,
                status: "FINAL",
                diff,
                previousSubmissionId: previous?.id ?? null,
                createdBy: userId,
              },
            })
          : await prisma.monthlySubmission.create({
              data: {
                userId,
                yearMonth: parsed.yearMonth,
                data: parsed.dataList,
                status: "FINAL",
                diff,
                previousSubmissionId: previous?.id ?? null,
                createdBy: userId,
              },
            });

          return NextResponse.json({ success: true, id: result.id, diffSummary: { added: Object.keys(diff.added).length, changed: Object.keys(diff.changed).length, removed: Object.keys(diff.removed).length } });

    
 
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message || "server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const yearMonth = searchParams.get('yearMonth');
  const status = searchParams.get('status') as SubmissionStatus;
      let userId: string | null = null;
    const session = await getSession(); // uncomment/adapt to your app
    if(!session) return NextResponse.json({ error: "auth required (no session )" }, { status: 401 });

    userId = session?.user?.id;
  if (yearMonth && userId) {
    const submission = await prisma.monthlySubmission.findMany({ where: { yearMonth: yearMonth, userId: userId, status:status } });
    if(submission.length < 1) return NextResponse.json({success:false, message:"submission not found" })

     return NextResponse.json({ success: true, submission });
  }
  // list all windows
  // const windows = await prisma.monthlySubmission.findMany({ orderBy: { yearMonth: "desc" } });
  return NextResponse.json({ success: false, message: "your not login" });
}