import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import './globals.css';
export const metadata:Metadata={title:'HuntMate — Twoja drużyna gra dalej',description:'Znajdź zastępstwo do team huntu w Tibii. Profile wykonawców, dostępność i rezerwacje w jednym miejscu.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pl" data-scroll-behavior="smooth"><body>{children}</body></html>}
