import React from 'react'

export default function fooid({ params }: { params: { id: string } }) {
  return (
    <div>fooid: {params.id}</div>
  )
}
