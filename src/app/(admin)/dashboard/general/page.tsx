import { GeneralPage } from '@/features/pages/general/main';
import { Metadata } from 'next';


export const metadata :Metadata  = {
  title : "Dashboard",
  description : "Dashboard "
}
export default function Page() {
  return <GeneralPage />;
}
