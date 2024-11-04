import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/** List of jokes. */

function JokeList({ numJokesToGet = 5 }) {
	const [jokes, setJokes] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	// state to trigger re-loading jokes
	const [reload, setReload] = useState(false);

	// Fetch jokes from the API when component mounts or new jokes are requested
	useEffect(() => {
		async function getJokes() {
			try {
				const jokesArray = [];
				const seenJokes = new Set();

				while (jokesArray.length < numJokesToGet) {
					const res = await axios.get(
						"https://icanhazdadjoke.com",
						{
							headers: { Accept: "application/json" },
						}
					);
					const joke = res.data;

					if (!seenJokes.has(joke.id)) {
						seenJokes.add(joke.id);
						jokesArray.push({ ...joke, votes: 0 });
					} else {
						console.log("Duplicate joke found, skipping.");
					}
				}
				setJokes(jokesArray);
				setIsLoading(false);
			} catch (err) {
				console.error("Failed to fetch jokes:", err);
			}
		}

		setIsLoading(true);
		getJokes();
	}, [numJokesToGet, reload]);

	// Handler to fetch new jokes
	function generateNewJokes() {
		setReload((reload) => !reload);
	}

	// Vote handler to update vote count for a specific joke
	function vote(id, delta) {
		setJokes((jokes) =>
			jokes.map((joke) =>
				joke.id === id
					? { ...joke, votes: joke.votes + delta }
					: joke
			)
		);
	}

	// Sort jokes by votes in descending order
	const sortedJokes = [...jokes].sort(
		(a, b) => b.votes - a.votes
	);

	if (isLoading) {
		return (
			<div className='loading'>
				<i className='fas fa-4x fa-spinner fa-spin' />
			</div>
		);
	}

	return (
		<div className='JokeList'>
			<button
				className='JokeList-getmore'
				onClick={generateNewJokes}
			>
				Get New Jokes
			</button>
			{sortedJokes.map((j) => (
				<Joke
					text={j.joke}
					key={j.id}
					id={j.id}
					votes={j.votes}
					vote={vote}
				/>
			))}
		</div>
	);
}

export default JokeList;
