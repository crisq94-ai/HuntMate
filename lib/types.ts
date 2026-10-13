import { z } from 'zod';
export const professions = ['Knight', 'Paladin', 'Druid', 'Sorcerer', 'Monk'] as const;
export type Profession = typeof professions[number];
export type Mode = 'client' | 'own';
export type Slot = { start: string; end: string };
export type User = { id: string; name: string; email: string; role: string; demo: number };
export type Specialization = { profession: Profession; min: number; max: number };
export type Character = { id: string; name: string; world: string; profession: Profession; level: number };
export type Provider = { id: string; name: string; avatar: string; description: string; status: string; hidden: number; modes: Mode[]; specs: Specialization[]; spawns: string[]; characters: Character[]; rating: number; reviewCount: number; nextAvailable: string | null; availability?: Slot[]; busy?: Slot[]; reviews?: Review[] };
export type Review = { id: string; bookingId: string; providerId: string; clientId: string; name: string; rating: number; comment: string; hidden: number; created: string };
export type Booking = { id: string; clientId: string; providerId: string; clientName: string; providerName: string; mode: Mode; profession: Profession; minLevel: number; maxLevel: number; world: string; spawn: string; note: string; characterId: string; status: string; slots: Slot[]; listingId: string | null; created: string; reviewId?: string | null };
export type Listing = { id: string; clientId: string; clientName: string; title: string; mode: Mode; profession: Profession; minLevel: number; maxLevel: number; world: string; spawn: string; note: string; budget: string; status: string; slots: Slot[]; candidates?: { providerId: string; name: string; characterId: string }[] };
export type Thread = { id: string; title: string; participants: string[]; names: string[]; updated: string; messages: { id: string; senderId: string; name: string; body: string; created: string }[] };
export type Notice = { id: string; body: string; href: string; read: number; created: string };
export type Account = { user: User; provider: Provider | null; bookings: Booking[]; listings: Listing[]; notifications: Notice[]; availability: Slot[] };
export const slotSchema = z.object({ start: z.iso.datetime(), end: z.iso.datetime() });
export const requestSchema = z.object({
  mode: z.enum(['client','own']), profession: z.enum(professions), minLevel: z.coerce.number().int().min(1).max(10000), maxLevel: z.coerce.number().int().min(1).max(10000),
  world: z.string().trim().min(2).max(60), spawn: z.string().trim().min(2).max(100), note: z.string().max(3000).default(''),
  slots: z.array(slotSchema).min(1).max(28), characterId: z.string().default('')
}).refine(v => v.maxLevel >= v.minLevel, { message: 'Górny poziom musi być równy lub wyższy od dolnego.' });
export type HuntRequest = z.infer<typeof requestSchema>;
export const modeLabel = (mode: Mode) => mode === 'own' ? 'Własna postać' : 'Na postaci klienta';
export const statusLabel: Record<string,string> = { pending:'Oczekuje na potwierdzenie', confirmed:'Potwierdzona', rejected:'Odrzucona', expired:'Wygasła', open:'Otwarte', filled:'Obsadzone', approved:'Zaakceptowany', paused:'Ukryty' };
