/**
 *
 * AttendancePage
 *
 */
import { ErrorModal } from 'app/components/ErrorModal';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled as muiStyled } from '@mui/system';
import { User } from 'types/types';
import Row from './Row';
import AddIcon from '@mui/icons-material/Add';

interface Props {
  token: string | null;
  removeToken: () => void;
}

export function AttendancePage(props: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [addUsers, setAddUsers] = useState<string>('');
  const [incorrect, setIncorrect] = useState<boolean>(false);

  useEffect(() => {
    const f = async () => {
      setLoading(true);
      const url = `${process.env.REACT_APP_BACKEND_URL}/attendance/`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + props.token,
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
        });
        setLoading(false);

        const res = await response.json();

        setUsers(res.users);

        if (response.status === 401 || response.status === 422) {
          props.removeToken();
          return;
        } else if (!response.ok) {
          setError(true);
          console.error(response);
        }
      } catch (e: any) {
        setError(true);
        console.error(e);
      }
    };

    f();
  }, [props, props.token]);

  const onDelete = (id: string) => {
    setUsers(users.filter(user => user._id !== id));
  };

  const onAddUsers = async () => {
    setLoading(true);
    const validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    for (const email of addUsers.split(', ')) {
      if (!validRegex.test(email)) {
        setIncorrect(true);
        setLoading(false);
        return;
      }
    }

    const url = `${process.env.REACT_APP_BACKEND_URL}/profile/`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + props.token,
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ emails: addUsers.split(', ') }),
      });

      if (response.status === 401 || response.status === 422) {
        props.removeToken();
        return;
      } else if (!response.ok) {
        setError(true);
        console.error(response);
      }

      const res = await response.json();
      setUsers([...users, ...res.users]);
      setLoading(false);
      setAddUsers('');
    } catch (e: any) {
      setError(true);
      console.error(e);
    }
  };

  const onSendPenalties = async () => {
    setLoading(true);
    const url = `${process.env.REACT_APP_BACKEND_URL}/attendance/`;
    const absent = users
      .filter((user: User) => user.absences.includes(date!))
      .map(user => user._id);
    const late = users
      .filter((user: User) => user.tardies.includes(date!))
      .map(user => user._id);

    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + props.token,
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ date, absent, late }),
      });

      if (response.status === 401 || response.status === 422) {
        props.removeToken();
        return;
      } else if (!response.ok) {
        setError(true);
        console.error(response);
      }

      setLoading(false);
    } catch (e: any) {
      setError(true);
      console.error(e);
    }
  };

  return (
    <>
      <Helmet>
        <title>Attendance</title>
        <meta name="description" content="Take attendance here" />
      </Helmet>
      {error && <ErrorModal open={error} />}
      <Form>
        <Stack spacing={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StyledStack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <DatePicker
                label="GM Date"
                value={date}
                onChange={(newValue: Dayjs | null) => {
                  setDate(newValue);
                }}
                renderInput={(params: any) => <TextField {...params} />}
              />
              {loading ? (
                <StyledCircularProgress />
              ) : (
                <StyledButton onClick={onSendPenalties} variant="contained">
                  Save
                </StyledButton>
              )}
            </StyledStack>
            <TextField
              label="Add User(s)"
              helperText="Enter emails as a comma-separated list with spaces."
              value={addUsers}
              onChange={e => setAddUsers(e.target.value)}
              error={incorrect}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={onAddUsers} edge="end">
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </LocalizationProvider>
          {date && (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Tardies</TableCell>
                    <TableCell align="right">Absences</TableCell>
                    <TableCell align="right">Strikes</TableCell>
                    <TableCell align="center">Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user: User) => (
                    <Row
                      key={user._id}
                      user={user}
                      date={date}
                      token={props.token}
                      removeToken={props.removeToken}
                      setLoading={setLoading}
                      setError={setError}
                      onDelete={onDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </Form>
    </>
  );
}

const Form = muiStyled(Paper)`
  width: 50%;
  margin: auto;
  padding: 64px;
  border-radius: 48px;
  margin-top: 24px;
  margin-bottom: 24px;
`;

const StyledStack = styled(Stack)`
  width: 100%;
`;

const StyledCircularProgress = muiStyled(CircularProgress)`
  color: rgb(255, 138, 0);
`;

const StyledButton = muiStyled(Button)`
  background-color: white;
  color: rgb(255, 138, 0);
  font-weight: bold;
`;
