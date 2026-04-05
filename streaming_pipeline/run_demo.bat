@echo off
REM Enhanced Clickstream ML Pipeline - Launcher
REM This script runs the refactored 4-layer architecture via run.py

setlocal enabledelayedexpansion

echo ==========================================
echo Clickstream ML Pipeline Launcher
echo ==========================================

REM Configuration
set DEMO_MODE=simulate
set SIMPLE_FLAG=

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :args_done
if "%~1"=="--mode" (
    set DEMO_MODE=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--simple" (
    set SIMPLE_FLAG=--simple
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    echo Usage: %0 [OPTIONS]
    echo Options:
    echo   --mode simulate     Run with simulated data (default)
    echo   --mode database     Run with real data from database
    echo   --mode stream       Run real-time streaming engine
    echo   --simple            Run without PySpark (pandas fallback)
    exit /b 0
)
shift
goto :parse_args

:args_done

echo Configuration:
echo   Mode: %DEMO_MODE%
echo   Simple: %SIMPLE_FLAG%
echo.

REM Check if run.py exists
if not exist "run.py" (
    echo Error: run.py not found. Please ensure you are in the streaming_pipeline directory.
    exit /b 1
)

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is required but not installed.
    exit /b 1
)

REM Check Spark installation unless simple mode is requested
if "%SIMPLE_FLAG%"=="" (
    if "%SPARK_HOME%"=="" (
        echo Warning: SPARK_HOME environment variable not set.
        echo Please ensure Apache Spark is installed and SPARK_HOME is set for full features.
        echo.
        set /p continue="Continue anyway or use --simple mode? (y/N): "
        if /i not "!continue!"=="y" exit /b 1
    )
)

REM Create output directory if it doesn't exist
if not exist "output" mkdir output

REM Run the pipeline
echo Starting pipeline [%DEMO_MODE%]...
echo.

python run.py %DEMO_MODE% %SIMPLE_FLAG%

echo.
echo ==========================================
echo Process Completed
echo ==========================================

if exist "output\" (
    echo Results generated in output/ directory.
)

pause
