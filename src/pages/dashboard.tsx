import { useAuth } from "../contexts/auth"
import { withSRRAuth } from "../utils/withSRRAuth"
import { api } from "../services/apiClient";
import { useEffect } from "react";
import { setupApiClient } from "../services/api";
import { Can } from "../components/can";

export default function Dashboard() {

  const { user } = useAuth()

  useEffect(() => {
    api.get('/me')
      .then(response => console.log)
  },[])

  return (
    <>
      <h1>
        {user?.email}
      </h1>
      <Can permissions={['metrics.aa']}>
        <div>Métricas</div>
      </Can>
    </>
  )
}

export const getServerSideProps = withSRRAuth(async (ctx) => {

  const apiClient = setupApiClient(ctx)
  const response = await apiClient.get('me')

  // console.log(response.data)

  return {
    props: {}
  }
})