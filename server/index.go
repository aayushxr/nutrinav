package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

var db *sql.DB

type LatLng struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Marker struct {
	ID            string   `json:"id"`
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	LatLng        LatLng   `json:"latlng"`
	userID        string   `json:"user_id"`
	BannerImage   string   `json:"banner_image"`
	GalleryImages []string `json:"gallery_images"`
	IsEmpty       bool     `json:"is_empty"`
}

type Request struct {
	ID          string `json:"id"`
	UserID      string `json:"user_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	LatLng      LatLng `json:"latlng"`
	MapURL      string `json:"map_url"`
	IsEmpty     bool   `json:"is_empty"`
}

type User struct {
	ID               string    `json:"id"`
	Username         string    `json:"username"`
	Email            string    `json:"email"`
	Submissions      []Request `json:"submissions"`
	ValidSubmissions []Request `json:"valid_submissions"`
}

func approveMarker(c *gin.Context) {
	markerID := c.Param("id")
	if markerID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id parameter is required"})
		return
	}

	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM requests WHERE id=?)", markerID).Scan(&exists)
	if err != nil {
		log.Printf("Error in addData (QueryRow): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Marker not found"})
		return
	}
	var data Marker
	err = db.QueryRow("SELECT id, title, desc, user_id, latitude, longitude, isEmpty,  FROM requests WHERE id=?", markerID).Scan(&data.ID, &data.Title, &data.Description, &data.userID, &data.LatLng.Latitude, &data.LatLng.Longitude, &data.IsEmpty)
	if err != nil {
		log.Printf("Error in approveMarker (QueryRow): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}

	_, err = db.Exec("INSERT INTO markers (id, title, desc, latitude, longitude, isEmpty, bannerImage) VALUES (?, ?, ?, ?, ?, ?, ?)", data.ID, data.Title, data.Description, data.LatLng.Latitude, data.LatLng.Longitude, data.IsEmpty, data.BannerImage)
	if err != nil {
		log.Printf("Error in approveMarker (Exec): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert marker"})
		return
	}

	for _, image := range data.GalleryImages {
		_, err = db.Exec("INSERT INTO gallery_images (marker_id, image_url) VALUES (?, ?)", data.ID, image)
		if err != nil {
			log.Printf("Error in approveMarker (Exec gallery image): %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert gallery image"})
			return
		}
	}

	_, err = db.Exec("INSERT INTO valid_submissions (user_id, request_id) VALUES (?,?)", data.userID, data.ID)

	_, err = db.Exec("DELETE FROM requests WHERE id=?", markerID)
	if err != nil {
		log.Printf("Error in approveMarker (Exec delete request): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Marker approved successfully"})

}

func addData(c *gin.Context) {
	userID := c.GetHeader("userID")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userID header is required"})
		return
	}

	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id=?)", userID).Scan(&exists)
	if err != nil {
		log.Printf("Error in addData (QueryRow): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	newID := uuid.New().String()

	var newMarker Marker
	if err := c.BindJSON(&newMarker); err != nil {
		return
	}
	res, err := db.Exec("INSERT INTO requests (id, userID,  title, desc) VALUES (?,?, ?, ?,)", newID, userID, newMarker.Title, newMarker.Description)
	if err != nil {
		log.Printf("Error in addData (Exec): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert data"})
		return
	}

	_, err = db.Exec("INSERT INTO submissions (user_id,  request_id) VALUES (?,?)", userID, newMarker.ID)
	if err != nil {
		log.Printf("Error in addData (Exec): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert data"})
		return
	}
	fmt.Println(res)
	c.JSON(http.StatusCreated, newMarker)
}

func getDatafromID(c *gin.Context) {
	// Get data from the server
	var data []Marker
	ID := c.Param("id")
	rows, err := db.Query("SELECT * FROM markers where id = ?", ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var mark Marker
		err := rows.Scan(&mark.ID, &mark.Title, &mark.Description, &mark.LatLng.Latitude, &mark.LatLng.Longitude, &mark.IsEmpty, &mark.BannerImage)
		if err != nil {
			log.Printf("Error in getData (Scan): %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row"})
			return
		}
		// Fetch gallery images for this marker
		galleryRows, err := db.Query("SELECT image_url FROM gallery_images WHERE marker_id = ?", mark.ID)
		if err != nil {
			log.Printf("Error fetching gallery images: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch gallery images"})
			return
		}
		defer galleryRows.Close()

		for galleryRows.Next() {
			var imageURL string
			if err := galleryRows.Scan(&imageURL); err != nil {
				log.Printf("Error scanning gallery image: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan gallery image"})
				return
			}
			mark.GalleryImages = append(mark.GalleryImages, imageURL)
		}
		data = append(data, mark)
	}
	if err := rows.Err(); err != nil {
		log.Printf("Error in getData (rows.Err): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Row iteration error"})
		return
	}

	c.IndentedJSON(http.StatusOK, data)
}

func getRequestDatafromID(c *gin.Context) {
	// Get data from the server
	var data []Marker
	ID := c.Param("id")
	rows, err := db.Query("SELECT * FROM requests where id = ?", ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var mark Marker
		err := rows.Scan(&mark.ID, &mark.Title, &mark.Description, &mark.LatLng.Latitude, &mark.LatLng.Longitude, &mark.IsEmpty, &mark.BannerImage)
		if err != nil {
			log.Printf("Error in getData (Scan): %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row"})
			return
		}
		// Fetch gallery images for this marker
		// galleryRows, err := db.Query("SELECT image_url FROM gallery_images WHERE marker_id = ?", mark.ID)
		// if err != nil {
		// 	log.Printf("Error fetching gallery images: %v", err)
		// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch gallery images"})
		// 	return
		// }
		// defer galleryRows.Close()

		// for galleryRows.Next() {
		// 	var imageURL string
		// 	if err := galleryRows.Scan(&imageURL); err != nil {
		// 		log.Printf("Error scanning gallery image: %v", err)
		// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan gallery image"})
		// 		return
		// 	}
		// 	mark.GalleryImages = append(mark.GalleryImages, imageURL)
		// }
		data = append(data, mark)
	}
	if err := rows.Err(); err != nil {
		log.Printf("Error in getData (rows.Err): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Row iteration error"})
		return
	}

	c.IndentedJSON(http.StatusOK, data)
}

func getData(c *gin.Context) {
	// Get data from the server
	var data []Marker
	rows, err := db.Query("SELECT * FROM markers")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var mark Marker
		err := rows.Scan(&mark.ID, &mark.Title, &mark.Description, &mark.LatLng.Latitude, &mark.LatLng.Longitude, &mark.IsEmpty, &mark.BannerImage)
		if err != nil {
			log.Printf("Error in getData (Scan): %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row"})
			return
		}
		// // Fetch gallery images for this marker
		// galleryRows, err := db.Query("SELECT image_url FROM gallery_images WHERE marker_id = ?", mark.ID)
		// if err != nil {
		// 	log.Printf("Error fetching gallery images: %v", err)
		// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch gallery images"})
		// 	return
		// }
		// defer galleryRows.Close()

		// for galleryRows.Next() {
		// 	var imageURL string
		// 	if err := galleryRows.Scan(&imageURL); err != nil {
		// 		log.Printf("Error scanning gallery image: %v", err)
		// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan gallery image"})
		// 		return
		// 	}
		// 	mark.GalleryImages = append(mark.GalleryImages, imageURL)
		// }
		data = append(data, mark)
	}
	if err := rows.Err(); err != nil {
		log.Printf("Error in getData (rows.Err): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Row iteration error"})
		return
	}

	c.IndentedJSON(http.StatusOK, data)
}

func getRequestData(c *gin.Context) {
	// Get data from the server
	var data []Marker
	rows, err := db.Query("SELECT * FROM requests")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var mark Marker
		err := rows.Scan(&mark.ID, &mark.Title, &mark.Description, &mark.LatLng.Latitude, &mark.LatLng.Longitude, &mark.IsEmpty, &mark.BannerImage)
		if err != nil {
			log.Printf("Error in getData (Scan): %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row"})
			return
		}
		data = append(data, mark)
	}
	if err := rows.Err(); err != nil {
		log.Printf("Error in getData (rows.Err): %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Row iteration error"})
		return
	}

	c.IndentedJSON(http.StatusOK, data)
}

func addUser(c *gin.Context) {
	var usr User

	// Bind JSON request to user struct
	if err := c.BindJSON(&usr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	ctx := context.Background()
	// Initialize Clerk client
	clerk.SetKey("sk_test_bjRfNuz79co4qtnhMrMdldhaJE2gkLO2GaaAGnIMPM")

	clerkUser, err := user.Get(ctx, usr.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		return
	}
	// Insert user into database
	_, err = db.Exec("INSERT INTO users (id, username, email) VALUES (?, ?, ?)",
		clerkUser.ID,
		clerkUser.EmailAddresses[0].EmailAddress,
		clerkUser.EmailAddresses[0].EmailAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}

func main() {
	router := gin.Default()

	cfg := mysql.Config{
		User:                 "root",
		Passwd:               "admin77",
		Net:                  "tcp",
		Addr:                 "192.168.1.77:3306",
		DBName:               "nutrinav",
		AllowNativePasswords: true,
	}

	// Get a database handle.
	var err error
	db, err = sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	pingErr := db.Ping()
	if pingErr != nil {
		log.Fatalf("Error pinging database: %v", pingErr)
	}
	fmt.Println("Connected to the database successfully!")

	router.GET("/markers", getData)
	router.GET("/requests", getRequestData)
	router.POST("/requests", addData)
	router.POST("/user", addUser)
	router.POST("/markers/:id/approve", approveMarker)
	router.GET("/markers/:id", getDatafromID)
	router.GET("/requests/:id", getRequestDatafromID)

	err = router.Run("localhost:3690")
	if err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
