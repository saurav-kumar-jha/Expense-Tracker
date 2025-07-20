import { firestore } from '@/config/firebase'
import { collection, onSnapshot, query, QueryConstraint } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useFetchData = <T>(
    collectionName:string,
    constraints: QueryConstraint[] =[]
) => {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        if(!collectionName) return;

        const collectionRef = collection(firestore, collectionName);
        const q = query(collectionRef, ...constraints)

        const unsub = onSnapshot(q, (snapshot)=>{
            const fetchData = snapshot.docs.map(docs=>{
                return {
                    id:docs.id,
                    ...docs.data()
                }
            }) as T[]
            setLoading(false)
            setData(fetchData)
        }, (err)=>{
            console.log(err.message);            
            setError(err.message);
            setLoading(false)
        })

        return ()=> unsub()
    },[])
  return {data, loading, error}
}

export default useFetchData