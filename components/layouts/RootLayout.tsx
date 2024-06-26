import { useEffect, useState } from 'react';
import authService from '../../service/auth/authService';
import { setToken, setUserData } from '../../lib/Slicers/authSlice';
import { useRouter } from 'next/router';

import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';

type Props = {
  children: string | JSX.Element | JSX.Element[];
};
const RootLayout = ({ children }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: any) => state.auth);
  const searchParams = useSearchParams();
  const guestToken = searchParams.get('user_t');

  const deleteAllCookies = async (): Promise<boolean> => {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    return true;
  };

  const navigateUser = () => {
    if (
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' ||
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'stage'
    ) {
      window.location.href = 'https://jsdude.com/login?ref=meetify';
      return;
    } else if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
      window.location.href = 'https://web.programming-hero.com/login?ref=meetify';
      return;
    } else {
      console.log('No environment found');
    }
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (guestToken === null) {
        let mounted = true;
        const savedToken = sessionStorage.getItem('jwt-token');
        const checkCookie = async () => {
          try {
            await authService.verifyCookie().then((res) => {
              if (!mounted) return;
              if (res.success) {
                getUserDetails(res.token);
              } else {
                navigateUser();
              }
            });
          } catch (error) {
            navigateUser();
          }
        };

        const getUserDetails = async (token: string, hasOldToken?: boolean) => {
          try {
            const userData: any = await authService.getUser(token, hasOldToken);
            if (userData?.user._id) {
              sessionStorage.setItem('jwt-token', `${userData.token}`);
              dispatch(setToken(userData.token));
              dispatch(setUserData({ ...userData.user }));
            }
          } catch (error) {
            sessionStorage.clear();
            await deleteAllCookies();
            await checkCookie();
            navigateUser();
          }
        };

        if (savedToken && savedToken !== null) {
          getUserDetails(savedToken, true);
        } else {
          checkCookie();
        }
        return () => {
          mounted = false;
        };
      }
    }, 100);
    return () => clearTimeout(timeOutId);
  }, [dispatch, guestToken]);

  useEffect(() => {
    if (userData.role && router.pathname.includes('/dashboard') && userData.role !== 'admin') {
      router.push('/');
    }
  }, [router, userData]);

  return (
    <main>
      {/* {router?.pathname?.includes('/dashboard') && <Header />} */}
      {children}
      {/* {!router?.pathname?.includes('/dashboard') && <Footer />} */}
    </main>
  );
};

export default RootLayout;
