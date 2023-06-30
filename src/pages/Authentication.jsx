import { useDispatch, useSelector } from 'react-redux';
import {
  handleUpdate, logInUser, registerUser, toggleFormAuth,
} from '../store/AuthenticationSlice';
import AuthRedirect from '../components/AuthRedirect/AuthRedirect';

const Authentication = () => {
  const dispatch = useDispatch();

  const {
    tempUser: {
      username, email, password, confirmPassword,
    },
  } = useSelector((state) => state.auth);

  const formAuth = useSelector((state) => state.auth.formAuth);

  const handleLogIn = (e) => {
    e.preventDefault();
    dispatch(
      logInUser({
        user: {
          email,
          password,
        },
      }),
    );
  };

  const handleRegister = (e) => {
    e.preventDefault();
    dispatch(
      registerUser({
        user: {
          username,
          email,
          password,
        },
      }),
    );
    dispatch(toggleFormAuth());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(handleUpdate({ name, value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formAuth === 'login') {
      handleLogIn(e);
    } else {
      handleRegister(e);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <h1>{formAuth === 'login' ? 'Log In' : 'Register'}</h1>
      {formAuth === 'register' && (
        <div>
          Username
          <input type="text" placeholder="username" id="username" name="username" value={username} onChange={(e) => handleChange(e)} required />
        </div>
      )}
      <div>
        Email
        <input type="email" placeholder="email" id="email" name="email" value={email} onChange={(e) => handleChange(e)} required />
      </div>
      <div>
        Password
        <input type="password" placeholder="password" id="password" name="password" value={password} onChange={(e) => handleChange(e)} required />
      </div>
      {formAuth === 'register' && (
        <div>
          Confirm Password
          <input type="password" placeholder="confirm password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => handleChange(e)} required />
        </div>
      )}
      <button type="submit">
        {formAuth === 'login' ? 'Log In' : 'Register'}
      </button>
      {formAuth === 'login' ? (
        <button type="button" onClick={() => dispatch(toggleFormAuth())}>
          Register
        </button>
      ) : (
        <button type="button" onClick={() => dispatch(toggleFormAuth())}>
          Log In
        </button>
      )}
    </form>
  );
};

export default AuthRedirect(Authentication);