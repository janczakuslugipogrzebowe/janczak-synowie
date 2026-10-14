import { TbAlertCircle,TbRefresh } from "react-icons/tb";
import { subtleButton,surfaceClass } from "@/components/ui/admin-fields";
export default function EditorState({phase,error,retry}:{phase:"loading"|"ready"|"error";error:string;retry:()=>void}){
 if(phase==="loading")return <p role="status" className="py-16 text-sm text-[#778177]">Wczytywanie…</p>;
 if(phase==="error")return <section role="alert" className={`${surfaceClass} p-8`}><TbAlertCircle size={30} className="mb-4 text-red-600"/><p className="mb-5 text-sm text-red-800">{error}</p><button type="button" onClick={retry} className={subtleButton}><TbRefresh/> Spróbuj ponownie</button></section>;
 return null;
}
