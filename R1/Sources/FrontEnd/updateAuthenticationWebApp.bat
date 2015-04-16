REM GRUNT BUILD
cd %~dp0

echo %1

if "%1"==""  goto nocountry 

if "%1"=="NONE"  goto nocountry

:country

CALL grunt build --baseUrl=/%1

xcopy /E /Y %~dp0\dist %~dp0\..\AuthenticationProxy\src\main\webapp
del %~dp0\..\AuthenticationProxy\src\main\webapp\sudo.html
del %~dp0\..\AuthenticationProxy\src\main\webapp\drawings.html
goto end

:nocountry
CALL grunt build
xcopy /E /Y %~dp0\dist %~dp0\..\AuthenticationProxy\src\main\webapp



:end
