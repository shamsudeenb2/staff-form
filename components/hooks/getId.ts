import { getSession } from "@/app/config/auth";


export async function getId() {
  const session = await getSession()
  if (!session){
    return null
  }
  const id =  session?.user?.id
  return id
}