import { updateDocument, deleteDocument } from '../../../../utils/db';

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const updates = await req.json();

    await updateDocument('helpDeskTickets', id, {
      ...updates,
      updatedAt: new Date(),
    });

    return new Response(JSON.stringify({ message: 'Ticket updated successfully' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating ticket' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await deleteDocument('helpDeskTickets', id);

    return new Response(JSON.stringify({ message: 'Ticket deleted successfully' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting ticket' }), { status: 500 });
  }
}
