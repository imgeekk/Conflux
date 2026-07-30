import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getExpertScoresByTag, getExpertScoresByUser } from "@/lib/services";

export async function GET(req: NextRequest) {
    try{
    await requireSession();

    const tagId = req.nextUrl.searchParams.get("tagId");
    const userId = req.nextUrl.searchParams.get("userId");

    if(tagId){
        const expertScore = await getExpertScoresByTag(tagId);
        return NextResponse.json(expertScore);
    }
    if(userId){
        const expertScore = await getExpertScoresByUser(userId);
        return NextResponse.json(expertScore);
    }

    return NextResponse.json({ error: "Missing tagId or userId" }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}