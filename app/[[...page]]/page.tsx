import HuntMate from '@/components/huntmate';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{page?:string[]}>}){const {page=[]}=await params;return <HuntMate route={page}/>}
