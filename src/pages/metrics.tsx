import { withSRRAuth } from "../utils/withSRRAuth"
import { setupApiClient } from "../services/api";

export default function Metrics() {
  return (
    <h1>
      Metrics
    </h1>
  )
}

export const getServerSideProps = withSRRAuth(async (ctx) => {

  const apiClient = setupApiClient(ctx)
  const response = await apiClient.get('me')

  return {
    props: {}
  }
}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
})