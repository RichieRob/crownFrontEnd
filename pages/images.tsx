

import styles from '../styles.module.css'
import Image from 'next/image'
import Link from 'next/link'
import vercel from '../public/vercel.png'
import type { PropsWithChildren } from 'react'

const Code = (props: PropsWithChildren<{}>) => (
    <code className={styles.inlineCode} {...props} />
  )


  const Images = () => (
<div className={styles.container}>
<Image
alt="Next.js logo"
src="https://assets.vercel.com/image/upload/v1538361091/repositories/next-js/next-js-bg.png"
width={1200}
height={400}
style={{
  maxWidth: '100%',
  height: 'auto',
}}
/>
</div>
  )
export default Images