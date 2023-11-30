import React, { useState, useEffect } from 'react'
import './index.css'
import axios from 'axios';
import Mcq from './mcq';

function Index() {
    const questionTypes = ['capital', 'flag', 'population', 'continent'];
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionData, setQuestionData] = useState({});
    const [timeSelected, setTimeSelected] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [ready, setReady] = useState(false);
    const [timer, setTimer] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [score, setScore] = useState(0);
    const [remainingTime, setRemainingTime] = useState(timeSelected);
    const [countdownStarted, setCountdownStarted] = useState(false);
    const [countdown, setCountdown] = useState(null);

    const countdownTime = {
        30: '30 seconds',
        60: '1 minute',
        120: '2 minutes',
    };

    useEffect(() => {
        if (ready && timeSelected !== null) {
            if (timer === null) {
                setRemainingTime(timeSelected);
                setTimer(
                    setInterval(() => {
                        setRemainingTime(prevTime => {
                            if (prevTime <= 0) {
                                clearInterval(timer);
                                handleFinish();
                                return prevTime;
                            }
                            return prevTime - 1;
                        });
                    }, 1000)
                );
            }
        }
        return () => clearInterval(timer);
    }, [ready, timeSelected, timer]);
    const handleCountdown = () => {
        setReady(false);
        setCountdownStarted(true);

        if (timeSelected !== null) {
            setCountdown(3);
            setTimeout(startQuestions, 3000); // 3 seconds countdown before starting questions
        }
    };
    const startQuestions = () => {
        setTimer(
            setInterval(() => {
                setRemainingTime(prevTime => {
                    if (prevTime <= 0) {
                        clearInterval(timer);
                        handleFinish();
                        return prevTime;
                    }
                    return prevTime - 1;
                });
            }, 1000)
        );

        fetchQuestionData();
    };

    const handleSkip = () => {
        const nextIndex = (currentQuestionIndex + 1) % questionTypes.length;
        setCurrentQuestionIndex(nextIndex);
        setRetryCount(0);
    };
    const handleTimeSelection = (time) => {
        setTimeSelected(time);
        setReady(true);
    };

    const handleFinish = () => {
        clearInterval(timer);
        setGameOver(true);
        const totalQuestions = questionTypes.length;
        const correctCounts = correctCount;
        const calculatedScore = Math.floor((correctCounts / totalQuestions) * 100);

        setScore(calculatedScore);
    };

    const handleReplay = () => {
        setReady(false);
        setGameOver(false);
        setTimeSelected(null);
        setRemainingTime(null);
        clearInterval(timer);
        setCountdownStarted(false);
    };


    useEffect(() => {
        fetchQuestionData();

    }, [currentQuestionIndex])

    const fetchQuestionData = () => {
        const currentType = questionTypes[currentQuestionIndex];
        if (currentType === 'capital') {
            axios.get('https://restcountries.com/v3.1/all')
                .then(response => {
                    const countries = response.data;
                    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
                    const question = `What is the capital of ${randomCountry.name.common}?`;
                    const correctAnswer = randomCountry.capital[0];
                    const options = getRandomCapitalOptions(countries, correctAnswer);
                    setQuestionData({ question, options, correctAnswer });
                })
                .catch(error => {
                    console.error('Error Fetching Data:', error)
                })
        }
        else if (currentType === 'flag') {
            axios.get('https://restcountries.com/v3.1/all')
                .then(response => {
                    const countries = response.data;
                    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
                    const question = 'Which country does this flag belong to?';
                    const correctAnswer = randomCountry.name.common;
                    const options = getRandomFlagOptions(countries, correctAnswer);
                    setQuestionData({ question, options, correctAnswer, flag: randomCountry.flags.png });
                })
                .catch(error => {
                    console.error('Error Fetching Flag Data:', error)
                })
        }
        else if (currentType === 'population') {
            axios.get('https://restcountries.com/v3.1/all')
                .then(response => {
                    const countries = response.data;
                    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
                    const population = randomCountry.population;
                    const populationRange = getPopulationRange(population);
                    const question = `Which country has a population between ${populationRange.min} and ${populationRange.max}?`;
                    const correctAnswer = randomCountry.name.common;
                    const options = getRandomPopulationOptions(countries, correctAnswer);
                    setQuestionData({ question, options, correctAnswer });
                })
                .catch(error => {
                    console.error('Error fetching population data:', error);
                });
        } else if (currentType === 'continent') {
            axios.get('https://restcountries.com/v3.1/all')
                .then(response => {
                    const countries = response.data;
                    const continents = getCountriesByContinent(countries);
                    const randomContinent = getRandomContinent(continents);
                    const randomCountry = getRandomCountryByContinent(countries, randomContinent);
                    const question = `Which continent is ${randomCountry.name.common} part of?`;
                    const correctAnswer = randomCountry.region;
                    const options = continents.filter(continent => continent !== correctAnswer);
                    options.push(correctAnswer);
                    setQuestionData({ question, options, correctAnswer });
                })
                .catch(error => {
                    console.error('Error fetching continent data:', error);
                });
        }
    }
    const getRandomCapitalOptions = (countries, correctAnswer) => {
        const options = [correctAnswer];
        while (options.length < 4) {
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            const capital = randomCountry.capital[0];
            if (!options.includes(capital)) {
                options.push(capital);
            }
        }
        return shuffleArray(options)
    }
    const getRandomFlagOptions = (countries, correctAnswer) => {
        const options = [correctAnswer];
        while (options.length < 4) {
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            const countryName = randomCountry.name.common;
            if (!options.includes(countryName)) {
                options.push(countryName);
            }
        }
        return shuffleArray(options);
    };
    const getPopulationRange = (population) => {
        const rangeMin = Math.floor(population / 50000) * 50000;
        const rangeMax = Math.ceil(population / 50000) * 50000;
        return { min: rangeMin, max: rangeMax };
    };
    const getRandomPopulationOptions = (countries, correctAnswer) => {
        const options = [correctAnswer];
        const usedCountries = new Set();

        while (options.length < 4) {
            const randomIndex = Math.floor(Math.random() * countries.length);
            const randomCountry = countries[randomIndex];
            if (usedCountries.has(randomIndex) || randomCountry.name.common === correctAnswer) {
                continue;
            }

            options.push(randomCountry.name.common);
            usedCountries.add(randomIndex);
        }

        return shuffleArray(options);
    };

    const getCountriesByContinent = (countries) => {
        const continents = [...new Set(countries.map(country => country.region))];
        return continents.filter(continent => continent !== '');
    };

    const getRandomContinent = (continents) => {
        return continents[Math.floor(Math.random() * continents.length)];
    };

    const getRandomCountryByContinent = (countries, continent) => {
        const countriesInContinent = countries.filter(country => country.region === continent);
        return countriesInContinent[Math.floor(Math.random() * countriesInContinent.length)];
    };

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5)
    }
    const handleSelectedAnswer = (selectedAnswer) => {
        if (selectedAnswer === questionData.correctAnswer) {
            console.log('Correct Answer; YAY!!');
            const nextIndex = (currentQuestionIndex + 1) % questionTypes.length;
            setCurrentQuestionIndex(nextIndex);
            setCorrectCount(prevCount => prevCount + 1);
        }
        else {
            console.log('Incorrect Answer!');
            setRetryCount(retryCount + 1);
            const nextIndex = (currentQuestionIndex + 1) % questionTypes.length;
            setCurrentQuestionIndex(nextIndex);
        }
    }


    return (
        <div>
            {/* Rendering time selection */}
            {!gameOver && !timeSelected && !ready && (
                <div>
                    <h3>Select Time:</h3>
                    {Object.keys(countdownTime).map((time) => (
                        <button key={time} onClick={() => handleTimeSelection(parseInt(time))}>
                            {countdownTime[time]}
                        </button>
                    ))}
                </div>
            )}
    
            {/* Countdown before starting the game */}
            {countdownStarted && countdown !== null && (
                <div>
                    <h3>{countdown}</h3>
                </div>
            )}
    
            {/* Countdown before starting questions */}
            {ready && timeSelected !== null && (
                <div>
                    <h3>Are you ready?</h3>
                    <button onClick={() => setReady(false)}>No</button>
                    <button onClick={() => handleCountdown()}>Yes</button>
                </div>
            )}
    
            {/* Countdown timer and questions */}
            {countdownStarted && remainingTime !== null && (
                <div>
                    <h3>Countdown</h3>
                    <p>Time remaining: {remainingTime} seconds</p>
    
                    {/* Display question data */}
                    {questionData.flag && (
                        <img src={questionData.flag} alt="Country Flag" />
                    )}
                    <Mcq
                        question={questionData.question}
                        options={questionData.options}
                        correctAnswer={questionData.correctAnswer}
                        onAnswerSelect={handleSelectedAnswer}
                    />
    
                    {/* Skip button */}
                    <button onClick={handleSkip}>Skip</button>
                </div>
            )}
    
            {/* Game Over */}
            {gameOver && (
                <div>
                    <p>Game Over! Your Score: {score}</p>
                    <button onClick={handleReplay}>Replay</button>
                </div>
            )}
        </div>
    );
}
export default Index