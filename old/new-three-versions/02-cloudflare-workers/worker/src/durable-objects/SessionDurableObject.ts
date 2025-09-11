import { DurableObject } from 'cloudflare:workers';
import { SessionData } from '../types';

export class SessionDurableObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return new Response('Session ID required', { status: 400 });
    }

    switch (request.method) {
      case 'POST':
        return await this.createSession(request, sessionId);
      case 'GET':
        return await this.getSession(sessionId);
      case 'DELETE':
        return await this.deleteSession(sessionId);
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  }

  private async createSession(request: Request, sessionId: string): Promise<Response> {
    try {
      const sessionData: SessionData = await request.json();
      
      // Store session data for 24 hours
      await this.ctx.storage.put(sessionId, {
        ...sessionData,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response('Failed to create session', { status: 500 });
    }
  }

  private async getSession(sessionId: string): Promise<Response> {
    try {
      const sessionData = await this.ctx.storage.get<SessionData>(sessionId);
      
      if (!sessionData) {
        return new Response('Session not found', { status: 404 });
      }

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        await this.ctx.storage.delete(sessionId);
        return new Response('Session expired', { status: 401 });
      }

      return new Response(JSON.stringify(sessionData), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response('Failed to get session', { status: 500 });
    }
  }

  private async deleteSession(sessionId: string): Promise<Response> {
    try {
      await this.ctx.storage.delete(sessionId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response('Failed to delete session', { status: 500 });
    }
  }
}