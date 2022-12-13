import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import * as querystring from "querystring";
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import styles from '../../styles/Home.module.css';

import { dbClientRepository, inMemoryScopeRepository } from "../../lib/oauth/repository";

export async function getServerSideProps(context: any) {
  const { scope, client_id } = context.query;

  const scopes = await inMemoryScopeRepository.getAllByIdentifiers(scope);
  const client = await dbClientRepository.getByIdentifier(client_id);

  return {
    props: { scopes, client },
  };
}

export default function VerifyScopes({ scopes, client }: any) {
  const { query } = useRouter();
  const submitUrl = useMemo(() => "/api/oauth/verify_scopes?" + querystring.stringify(query), [query]);

  return <main className={styles.main}>
   
   <h1 className={styles.title}>Web3 Music Vault</h1>
   
    <p>Do you allow <strong>{client.name}</strong> the following permissions?</p>
    <ul>
      {scopes.map((scope: any) => <li key={scope.name}>{scope.description}</li>)}
    </ul>
    <Stack spacing={2} direction="row">
      <form action={submitUrl} method="POST">
        <input type="hidden" name="accepted" value="true" />
        {/* <button type="submit">Allow</button> */}
        <Button variant="contained" type="submit">Allow</Button>

      </form>
      <form action={submitUrl} method="POST">
        <input type="hidden" name="accepted" value="false" />
        <Button variant="contained" type="submit">Deny</Button>
      </form>
    </Stack>

  </main>;
}
