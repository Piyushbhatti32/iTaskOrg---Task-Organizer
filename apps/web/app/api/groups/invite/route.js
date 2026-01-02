import { NextResponse } from "next/server";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase-client";
import { getGroup, addGroupMember } from "@/utils/db";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * Invite users to a group
 * POST /api/groups/invite
 */

const auth = getFirebaseAuth();
const db = getFirestoreDb();

export async function POST(request) {
  try {
    const { groupId, emails } = await request.json();
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get group details
    const group = await getGroup(groupId);

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is an admin or if members can invite
    const isAdmin = group.members[userId]?.role === "admin";
    const canInvite =
      group.settings.allowMemberInvites && group.members[userId];

    if (!isAdmin && !canInvite) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Find users by email
    const usersRef = collection(db, "users");
    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          const q = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            return {
              email,
              status: "not_found",
            };
          }

          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();

          // Skip if already a member
          if (group.members[userDoc.id]) {
            return {
              email,
              status: "already_member",
            };
          }

          // Add user to group
          await addGroupMember(groupId, userDoc.id, "member");

          return {
            email,
            status: "invited",
            userId: userDoc.id,
          };
        } catch (error) {
          console.error(`Error inviting ${email}:`, error);
          return {
            email,
            status: "error",
            error: error.message,
          };
        }
      })
    );

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error("Error inviting users:", error);
    return NextResponse.json(
      { error: "Failed to invite users" },
      { status: 500 }
    );
  }
}
