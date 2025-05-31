import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, map, Observable, of } from 'rxjs';
import { Movie } from '../models/movie.model';

@Injectable({
	providedIn: 'root'
})
export class MoviesService {
	private apiUrl = 'https://localhost:7144';

	constructor(private http: HttpClient) { }

	getMovies(): Observable<Movie[]> {
		return this.http.get<Movie[]>(`${this.apiUrl}/Movies/GetAll`).pipe(map(movies => movies.filter(m => m.latitude && m.longitude)));
		// return of([
		// 	{ latitude: '-34.61315', longitude: '-58.37723', applicant: 'Example 1', location: 'oroño 14545'}, 
		// 	{ latitude: '-34.61615', longitude: '-58.38723', applicant: 'Example 2', location: 'libertad 43543'}
		// ])
	}
}