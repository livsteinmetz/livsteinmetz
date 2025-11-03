import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import ReflectionForm from './ReflectionForm';
import { getReflection } from '../../lib/api';

export default function EditReflection() {
  const { id } = useParams<{ id: string }>();
  const [r, setR] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    getReflection(id).then(setR);
  }, [id]);

  if (!r) return null;
  return (
    <div>
      <h1>Edit Reflection</h1>
      <ReflectionForm id={id!} initial={r} />
    </div>
  );
}
