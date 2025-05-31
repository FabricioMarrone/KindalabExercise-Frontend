import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MoviesService } from '../../services/movies.service';
import { HttpClientModule } from '@angular/common/http';
import { Movie } from '../../models/movie.model';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { concatMap, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
	selector: 'app-map',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, MatProgressBarModule, HttpClientModule, MatInputModule, MatFormFieldModule, MatAutocompleteModule],
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
	private map!: L.Map;

	searchControl = new FormControl('');
	movies: Movie[] = [];
	movieTitles: string[] = [];
	filteredMovies!: Observable<Movie[]>;
	filteredMovieTitles: string[] = [];
	loading: boolean = true;
	markers: L.Marker<any>[] = [];

	constructor(private moviesService: MoviesService) { }

	ngAfterViewInit(): void {	
		this.initMap();	
		this.loadMovies();
	}

	private initMap(): void {
		this.map = L.map('map-container').setView([37.7577607, -122.4787995], 12); // San Francisco, CA, USA

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		}).addTo(this.map);
	}

	private loadMovies(): void {
		this.loading = true;
		this.moviesService.getMovies().pipe(tap(()=> this.loading = false)).subscribe((movies) => {
			this.movies = movies;

			this.filteredMovies = this.searchControl.valueChanges.pipe(
				startWith(''),
				map(value => this.filterMoviesByTitle(value ?? '')),
				switchMap(filteredValues => this.renderMoviesOnMap(filteredValues)),
				map(filteredValues => this.distinctByTitle(filteredValues))
			);
		});
	}

	private renderMoviesOnMap(moviesToRender: Movie[]): Observable<Movie[]> {
		// removing previous markers
		this.markers.forEach(marker => this.map.removeLayer(marker));
		this.markers = [];

		// adding new ones
		moviesToRender.forEach((movie: Movie) => {
			const marker = L.marker([parseFloat(movie.latitude || ''), parseFloat(movie.longitude || '')])
				.bindPopup(`<b>${movie.title}</b><br>${movie.locations}`)
				.addTo(this.map);
			this.markers.push(marker);
		});

		return of(moviesToRender);
	}

	filterMoviesByTitle(value: string): Movie[] {
		const filterValue = value.toLowerCase();
		return this.movies.filter(movie => movie.title.toLowerCase().includes(filterValue));
	}

	distinctByTitle(movies: Movie[]): Movie[] {
		return movies.filter((item, i, d) => d.findIndex(v => v.title == item.title) === i);	// distinct on titles
	}

	onSelect(movie: Movie) {
		console.log(`Selected: ${movie.title}`);
	}
}