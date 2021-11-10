import { useEffect } from 'react'
import { signOut } from '../contexts/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { setupAPIClient } from '../services/api'
import { api } from '../services/apiClient'
import { withSSRAuth } from '../utils/withSSRAuth'
import { Can } from '../components/Can'

import styles from '../styles/Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  // const userCanSeeMetrics = useCan({
  //   permissions: ["metrics.list"],
  //   roles: ["administrator", "editor"],
  // });

  useEffect(() => {
    api
      .get('/me')
      .then(response => console.log(response))
      .catch(err => {
        console.log('dashboard', err)
      })
  }, [])

  return (
    <div className="container">
      <div className={styles.headerDashboard}>
        <h1>Dashboard: {user?.email}</h1>
        <button className={styles.signOutButton} onClick={signOut}>
          Sign Out
        </button>
      </div>

      <Can permissions={['metrics.list']}>
        <div className={styles.metrics}>Metrics</div>
      </Can>
    </div>
  )
}

export const getServerSideProps = withSSRAuth(async ctx => {
  const api = setupAPIClient(ctx)

  const { data } = await api.get('me')
  console.log(data)

  return {
    props: {},
  }
})
