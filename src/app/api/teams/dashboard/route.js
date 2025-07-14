import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { 
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

// GET /api/teams/dashboard - Get team dashboard data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const userId = searchParams.get('userId');

    if (!teamId || !userId) {
      return NextResponse.json({ 
        error: 'Team ID and user ID are required' 
      }, { status: 400 });
    }

    // Verify team exists and user is a member
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);

    if (!teamDoc.exists()) {
      return NextResponse.json({ 
        error: 'Team not found' 
      }, { status: 404 });
    }

    const memberRef = doc(db, 'teams', teamId, 'members', userId);
    const memberDoc = await getDoc(memberRef);

    if (!memberDoc.exists()) {
      return NextResponse.json({ 
        error: 'User is not a team member' 
      }, { status: 403 });
    }

    // Get team data
    const teamData = teamDoc.data();

    // Get all team members
    const membersRef = collection(db, 'teams', teamId, 'members');
    const membersSnapshot = await getDocs(membersRef);
    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get all team tasks
    const tasksRef = collection(db, 'teams', teamId, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get recent activity (notifications)
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('teamId', '==', teamId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const notificationsSnapshot = await getDocs(q);
    const recentActivity = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate task statistics
    const taskStats = {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      accepted: tasks.filter(task => task.status === 'accepted').length,
      rejected: tasks.filter(task => task.status === 'rejected').length,
      completed: tasks.filter(task => task.status === 'completed').length
    };

    // Calculate member statistics
    const memberStats = members.map(member => {
      const memberTasks = tasks.filter(task => task.assignedTo === member.id);
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        taskStats: {
          total: memberTasks.length,
          pending: memberTasks.filter(task => task.status === 'pending').length,
          accepted: memberTasks.filter(task => task.status === 'accepted').length,
          rejected: memberTasks.filter(task => task.status === 'rejected').length,
          completed: memberTasks.filter(task => task.status === 'completed').length
        }
      };
    });

    return NextResponse.json({
      team: {
        id: teamId,
        name: teamData.name,
        description: teamData.description,
        leaderId: teamData.leaderId,
        createdAt: teamData.createdAt
      },
      members,
      tasks,
      taskStats,
      memberStats,
      recentActivity
    });
  } catch (error) {
    console.error('Error getting team dashboard:', error);
    return NextResponse.json({ 
      error: 'Failed to get team dashboard' 
    }, { status: 500 });
  }
} 