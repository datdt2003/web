"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Package,
  Users,
  Search,
  Edit,
  Trash2,
  Upload,
  Video,
  ImageIcon,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Loader2,
  Film,
  ExternalLink,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Crop,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ethnicGroups, formatVND, products as defaultEthnicProducts } from "@/lib/ethnic-data"
import { ImageCropperModal } from "@/components/image-cropper-modal"
import { parseVideoEmbedUrl } from "@/components/video-player"

const BACKEND_URL =
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
    ? "http://localhost:5000"
    : (process.env.NEXT_PUBLIC_BACKEND_URL || "https://honydatvietbe.vercel.app")

interface OrderItem {
  productId: string
  name: string
  price: number
  qty: number
  image?: string
  category?: string
}

interface Order {
  _id: string
  customerName: string
  email: string
  phone?: string
  address?: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  status: string
  paymentStatus?: string
  paymentCode?: string
  paidAt?: string
  notes?: string
  createdAt: string
}

interface Ethnic {
  slug: string
  name: string
  altNames?: string
  region: "bac" | "trung" | "nam" | string
  regions?: ("bac" | "trung" | "nam" | string)[]
  residenceArea?: string
  population: number
  languageFamily?: string
  image?: string
  blurb?: string
  detail?: string
  culture: string[]
  videoUrl?: string
}

interface ProductItem {
  _id?: string
  id: string
  name: string
  price: number
  image: string
  ethnicSlug: string
  category: string
  description?: string
  origin?: string
  craft?: string
  culturalValue?: string
  forSale: boolean
  inStock: boolean
  createdAt?: string
}

const DEFAULT_PRODUCT_FORM = {
  id: "",
  name: "",
  price: "",
  image: "",
  ethnicSlug: "",
  category: "Thủ công",
  description: "",
  forSale: true,
  inStock: true,
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48)

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "ethnics">("orders")

  // --- Orders State ---
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [orderFilter, setOrderFilter] = useState<string>("all")
  const [orderCurrentPage, setOrderCurrentPage] = useState(1)
  const ORDERS_PER_PAGE = 6
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<Order | null>(null)

  // --- Products State ---
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productForm, setProductForm] = useState(DEFAULT_PRODUCT_FORM)
  const [submittingProduct, setSubmittingProduct] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<ProductItem | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [productEthnicFilter, setProductEthnicFilter] = useState("all")
  const [productStatusFilter, setProductStatusFilter] = useState("all") // "all" | "in_stock" | "out_of_stock"
  const [productCurrentPage, setProductCurrentPage] = useState(1)
  const PRODUCTS_PER_PAGE = 9

  // Combobox gợi ý dân tộc cho form đăng sản phẩm
  const [createEthnicOpen, setCreateEthnicOpen] = useState(false)
  const createEthnicDropdownRef = useRef<HTMLDivElement>(null)

  // Combobox gợi ý dân tộc cho modal sửa sản phẩm
  const [editEthnicOpen, setEditEthnicOpen] = useState(false)
  const editEthnicDropdownRef = useRef<HTMLDivElement>(null)

  // --- Edit Product Modal State ---
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [editProductForm, setEditProductForm] = useState({
    name: "",
    price: "",
    image: "",
    ethnicSlug: "",
    category: "Thủ công",
    description: "",
    inStock: true,
  })
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false)
  const [uploadingEditProductImage, setUploadingEditProductImage] = useState(false)
  const editProductImageInputRef = useRef<HTMLInputElement>(null)

  // --- Ethnics State ---
  const [ethnics, setEthnics] = useState<Ethnic[]>([])
  const [loadingEthnics, setLoadingEthnics] = useState(true)
  const [ethnicSearch, setEthnicSearch] = useState("")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [videoFilter, setVideoFilter] = useState<string>("all")

  // --- Edit Ethnic Modal State ---
  const [editingEthnic, setEditingEthnic] = useState<Ethnic | null>(null)
  const [formData, setFormData] = useState<Partial<Ethnic>>({})
  const [cultureInput, setCultureInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // --- Ethnic Traditional Products Management (trong modal sửa dân tộc) ---
  const [ethnicProductFormOpen, setEthnicProductFormOpen] = useState(false)
  const [editingEthnicProduct, setEditingEthnicProduct] = useState<ProductItem | null>(null)
  const [ethnicProductForm, setEthnicProductForm] = useState({
    name: "",
    category: "",
    image: "",
    origin: "",
    craft: "",
    culturalValue: "",
    description: "",
  })
  const [uploadingEthnicProdImg, setUploadingEthnicProdImg] = useState(false)
  const [savingEthnicProd, setSavingEthnicProd] = useState(false)
  const ethnicProdImageInputRef = useRef<HTMLInputElement>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [brokenImgSlugs, setBrokenImgSlugs] = useState<Record<string, boolean>>({})

  // Image Cropper Modal State
  const [cropperModal, setCropperModal] = useState<{
    isOpen: boolean
    imageUrl: string
    title: string
    aspectRatio?: number
    onApply: (croppedUrl: string) => void
  }>({
    isOpen: false,
    imageUrl: "",
    title: "",
    aspectRatio: 1,
    onApply: () => {},
  })

  const normalizeUploadUrl = (url: string) => {
    if (!url) return ""
    if (url.includes("/uploads/")) {
      const fn = url.split("/uploads/").pop()
      return `/api/upload/${fn}`
    }
    return url
  }

  const openCropper = (
    imageUrl: string | undefined,
    title: string,
    onApply: (croppedUrl: string) => void,
    aspectRatio = 1
  ) => {
    if (!imageUrl) {
      alert("Vui lòng tải hoặc dán link ảnh trước khi căn chỉnh!")
      return
    }
    setCropperModal({
      isOpen: true,
      imageUrl: normalizeUploadUrl(imageUrl),
      title,
      aspectRatio,
      onApply,
    })
  }

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createEthnicDropdownRef.current && !createEthnicDropdownRef.current.contains(e.target as Node)) {
        setCreateEthnicOpen(false)
      }
      if (editEthnicDropdownRef.current && !editEthnicDropdownRef.current.contains(e.target as Node)) {
        setEditEthnicOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Danh sách gợi ý dân tộc cho form tạo mới
  const createEthnicSuggestions = ethnicGroups.filter(
    (g) =>
      !productForm.ethnicSlug ||
      g.name.toLowerCase().includes(productForm.ethnicSlug.toLowerCase()) ||
      g.slug.toLowerCase().includes(productForm.ethnicSlug.toLowerCase())
  )

  // Danh sách gợi ý dân tộc cho form chỉnh sửa
  const editEthnicSuggestions = ethnicGroups.filter(
    (g) =>
      !editProductForm.ethnicSlug ||
      g.name.toLowerCase().includes(editProductForm.ethnicSlug.toLowerCase()) ||
      g.slug.toLowerCase().includes(editProductForm.ethnicSlug.toLowerCase())
  )

  // Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      // Ưu tiên gọi backend NestJS, nếu không được thì gọi Next API
      const res = await fetch(`${BACKEND_URL}/api/orders`).catch(() => fetch("/api/orders"))
      if (res.ok) {
        const data = await res.json()
        setOrders(data.data || [])
      }
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Lấy danh sách dân tộc
  const fetchEthnics = async () => {
    setLoadingEthnics(true)
    try {
      let loadedEthnics: Ethnic[] = []

      // 1. Ưu tiên gọi Next.js API nội bộ (kết nối trực tiếp MongoDB Atlas)
      try {
        const nextRes = await fetch("/api/ethnic")
        if (nextRes.ok) {
          const nextData = await nextRes.json()
          if (Array.isArray(nextData.data) && nextData.data.length > 0) {
            loadedEthnics = nextData.data
          }
        }
      } catch (e) {
        console.warn("Next.js /api/ethnic fetch failed:", e)
      }

      // 2. Dự phòng gọi backend NestJS nếu có
      if (loadedEthnics.length === 0) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/ethnic`)
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data.data) && data.data.length > 0) {
              loadedEthnics = data.data
            }
          }
        } catch (e) {
          console.warn("Backend /api/ethnic fetch failed:", e)
        }
      }

      // 3. Fallback an toàn sang dữ liệu 54 dân tộc chuẩn có sẵn
      if (loadedEthnics.length === 0) {
        loadedEthnics = ethnicGroups
      }

      setEthnics(loadedEthnics)
    } catch (err) {
      console.error("Lỗi khi tải danh sách dân tộc:", err)
      setEthnics(ethnicGroups)
    } finally {
      setLoadingEthnics(false)
    }
  }

  // Lấy danh sách sản phẩm đang bán
  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const res = await fetch("/api/products")
      if (res.ok) {
        const data = await res.json()
        setProducts(data.data || [])
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách sản phẩm:", err)
    } finally {
      setLoadingProducts(false)
    }
  }

  const resetProductForm = () => setProductForm(DEFAULT_PRODUCT_FORM)

  const handleProductImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Ưu tiên /api/upload của Next.js (lưu trực tiếp MongoDB Atlas, dùng URL relative)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }).catch(() => fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: formData }))

      const data = await res.json()
      if (res && res.ok && data.url) {
        const finalUrl = normalizeUploadUrl(data.url)
        setProductForm((prev) => ({ ...prev, image: finalUrl }))
        setToastMessage("Tải ảnh sản phẩm thành công! Bạn có thể nhấn 'Căn chỉnh ảnh' để điều chỉnh khung hình.")
      } else {
        alert(data?.error || data?.message || "Tải ảnh thất bại.")
      }
    } catch (err) {
      console.error("Upload sản phẩm error:", err)
      alert("Không thể upload ảnh sản phẩm. Hãy kiểm tra kết nối.")
    } finally {
      event.target.value = ""
    }
  }

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault()

    const ethnicValue = productForm.ethnicSlug.trim()
    const payload = {
      ...productForm,
      ethnicSlug: ethnicValue || "Chung",
      category: productForm.category || "Thủ công",
      id: productForm.id || slugify(productForm.name || `san-pham-${Date.now()}`),
      price: Number(productForm.price),
      forSale: Boolean(productForm.forSale),
      inStock: Boolean(productForm.inStock),
    }

    if (!payload.name || !payload.price) {
      alert("Vui lòng nhập tên sản phẩm và giá bán.")
      return
    }

    if (!payload.image) {
      payload.image = "/placeholder.svg"
    }

    setSubmittingProduct(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo sản phẩm.")
      }

      setProducts((prev) => [data.data, ...prev])
      setToastMessage(`Đã đăng sản phẩm ${payload.name} lên cửa hàng!`)
      resetProductForm()
    } catch (err) {
      console.error("Create product error:", err)
      alert(err instanceof Error ? err.message : "Không thể đăng sản phẩm.")
    } finally {
      setSubmittingProduct(false)
    }
  }

  // Gỡ hoàn toàn sản phẩm khỏi hệ thống qua Popup xác nhận
  const handleConfirmDelete = async () => {
    if (!confirmDeleteProduct) return

    const { id: productId, name: productName } = confirmDeleteProduct
    setDeletingProductId(productId)
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Gỡ sản phẩm thất bại.")
      }

      setProducts((prev) => prev.filter((product) => product.id !== productId))
      setToastMessage(`Đã gỡ vĩnh viễn sản phẩm "${productName || productId}" thành công.`)
      setConfirmDeleteProduct(null)
    } catch (err) {
      console.error("Delete product error:", err)
      alert(err instanceof Error ? err.message : "Không thể gỡ sản phẩm.")
    } finally {
      setDeletingProductId(null)
    }
  }

  // Mở modal sửa sản phẩm
  const openEditProductModal = (product: ProductItem) => {
    setEditingProduct(product)
    setEditProductForm({
      name: product.name,
      price: String(product.price),
      image: product.image,
      ethnicSlug: product.ethnicSlug || "",
      category: product.category || "Thủ công",
      description: product.description || "",
      inStock: Boolean(product.inStock),
    })
  }

  // Upload ảnh khi sửa sản phẩm
  const handleEditProductImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    setUploadingEditProductImage(true)

    try {
      // Ưu tiên /api/upload của Next.js (lưu trực tiếp MongoDB Atlas, dùng URL relative)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }).catch(() => fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: formData }))

      const data = await res.json()
      if (res && res.ok && data.url) {
        const finalUrl = normalizeUploadUrl(data.url)
        setEditProductForm((prev) => ({ ...prev, image: finalUrl }))
        setToastMessage("Tải ảnh mới cho sản phẩm thành công! Bạn có thể nhấn 'Căn chỉnh ảnh' để điều chỉnh.")
      } else {
        alert(data?.error || data?.message || "Tải ảnh thất bại.")
      }
    } catch (err) {
      console.error("Upload edit product image error:", err)
      alert("Không thể upload ảnh mới. Hãy kiểm tra kết nối backend.")
    } finally {
      setUploadingEditProductImage(false)
      event.target.value = ""
    }
  }

  // Lưu thông tin chỉnh sửa sản phẩm
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    const ethnicValue = editProductForm.ethnicSlug.trim()
    if (!editProductForm.name || !editProductForm.price || !editProductForm.image || !ethnicValue) {
      alert("Vui lòng điền đầy đủ tên sản phẩm, giá, ảnh và dân tộc.")
      return
    }

    setIsUpdatingProduct(true)
    const payload = {
      name: editProductForm.name,
      price: Number(editProductForm.price),
      image: editProductForm.image,
      ethnicSlug: ethnicValue,
      category: editProductForm.category || "Thủ công",
      description: editProductForm.description,
      inStock: Boolean(editProductForm.inStock),
      forSale: true,
    }

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật sản phẩm.")
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
      )
      setToastMessage(`Đã cập nhật thông tin sản phẩm "${payload.name}" thành công!`)
      setEditingProduct(null)
    } catch (err) {
      console.error("Update product error:", err)
      alert(err instanceof Error ? err.message : "Lỗi khi cập nhật sản phẩm.")
    } finally {
      setIsUpdatingProduct(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchProducts()
    fetchEthnics()

    // Lắng nghe sự kiện realtime qua SSE
    const eventSource = new EventSource("/api/realtime")

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "order.created" || data.type === "order.updated" || data.type === "order.deleted") {
          // Báo có đơn hàng mới hoặc trạng thái thay đổi / xóa
          setToastMessage(`Có cập nhật mới về đơn hàng!`)
          fetchOrders() // Tải lại danh sách đơn
        } else if (data.type === "ethnic.updated") {
          fetchEthnics()
        } else if (data.type === "product.created" || data.type === "product.updated" || data.type === "product.deleted") {
          // Sản phẩm vừa được tạo / sửa / xóa → tải lại danh sách
          fetchProducts()
        }
      } catch (err) {
        console.error("Lỗi xử lý sự kiện realtime:", err)
      }
    }

    eventSource.onerror = (error) => {
      console.error("Lỗi kết nối realtime:", error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).catch(() =>
        fetch(`/api/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })
      )

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        )
        setToastMessage(`Đã cập nhật trạng thái đơn hàng #${orderId.slice(-6)}!`)
      }
    } catch (err) {
      console.error("Lỗi cập nhật đơn hàng:", err)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Xóa vĩnh viễn đơn hàng đã hủy
  const handleConfirmDeleteOrder = async () => {
    if (!confirmDeleteOrder) return

    const orderId = confirmDeleteOrder._id
    setDeletingOrderId(orderId)
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() =>
        fetch(`/api/orders/${orderId}`, {
          method: "DELETE",
          credentials: "include",
        })
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || data.message || "Xóa đơn hàng thất bại.")
      }

      setOrders((prev) => prev.filter((o) => o._id !== orderId))
      setToastMessage(`Đã xóa vĩnh viễn đơn hàng #${orderId.slice(-8).toUpperCase()}!`)
      setConfirmDeleteOrder(null)
    } catch (err) {
      console.error("Delete order error:", err)
      alert(err instanceof Error ? err.message : "Không thể xóa đơn hàng.")
    } finally {
      setDeletingOrderId(null)
    }
  }

  // Mở modal sửa dân tộc
  const openEditModal = (ethnic: Ethnic) => {
    setEditingEthnic(ethnic)
    setEthnicProductFormOpen(false)
    setEditingEthnicProduct(null)
    const initialRegions: ("bac" | "trung" | "nam")[] =
      ethnic.regions && ethnic.regions.length > 0
        ? [...(ethnic.regions as ("bac" | "trung" | "nam")[])]
        : ethnic.region && ["bac", "trung", "nam"].includes(ethnic.region)
        ? [ethnic.region as "bac" | "trung" | "nam"]
        : ["bac"]

    setFormData({
      ...ethnic,
      regions: initialRegions,
      region: ethnic.region || initialRegions[0] || "bac",
      culture: ethnic.culture ? [...ethnic.culture] : [],
    })
    setCultureInput(ethnic.culture ? ethnic.culture.join(", ") : "")
  }

  // Upload file (ảnh hoặc video) lên máy chủ
  const handleFileUpload = async (file: File, type: "image" | "video") => {
    if (type === "video" && file.size > 50 * 1024 * 1024) {
      alert("File video quá lớn (> 50MB). Vui lòng chọn video dung lượng nhẹ hơn hoặc dán trực tiếp link YouTube/Drive vào ô bên dưới.")
      return
    }

    const uploadForm = new FormData()
    uploadForm.append("file", file)

    if (type === "image") setUploadingImage(true)
    else setUploadingVideo(true)

    try {
      let res: Response | null = null

      // 1. Thử qua Next.js API /api/upload
      try {
        res = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        })
      } catch (err) {
        console.warn("Lỗi gọi /api/upload:", err)
      }

      // 2. Nếu /api/upload không thành công hoặc lỗi (413/500), thử fallback sang backend
      if (!res || !res.ok) {
        try {
          const backendRes = await fetch(`${BACKEND_URL}/api/upload`, {
            method: "POST",
            body: uploadForm,
          })
          if (backendRes.ok) {
            res = backendRes
          }
        } catch (beErr) {
          console.warn("Lỗi gọi backend /api/upload:", beErr)
        }
      }

      if (!res) {
        throw new Error("Không thể kết nối đến máy chủ tải file. Vui lòng kiểm tra kết nối mạng.")
      }

      let data: any = null
      const text = await res.text()
      try {
        data = JSON.parse(text)
      } catch {
        if (res.status === 413) {
          throw new Error(
            "File video vượt quá giới hạn tải lên trực tiếp của máy chủ (tối đa 4.5MB). Bạn có thể dán trực tiếp đường link video YouTube hoặc Google Drive vào ô bên dưới (khuyên dùng, không giới hạn dung lượng)."
          )
        }
        throw new Error(text || `Máy chủ phản hồi mã lỗi ${res.status}`)
      }

      if (res.ok && data?.url) {
        const finalUrl = normalizeUploadUrl(data.url)
        if (type === "image") {
          setFormData((prev) => ({ ...prev, image: finalUrl }))
          setToastMessage("Tải ảnh mới lên thành công! Bạn có thể nhấn 'Căn chỉnh ảnh' để điều chỉnh.")
        } else {
          setFormData((prev) => ({ ...prev, videoUrl: finalUrl }))
          setToastMessage("Tải video mới lên thành công!")
        }
      } else {
        const errorMsg = data?.message || data?.error || "Tải file lên thất bại."
        if (type === "video" && (res.status === 413 || errorMsg.includes("413") || errorMsg.includes("large") || errorMsg.includes("size"))) {
          alert(
            "File video quá lớn đối với giới hạn máy chủ tải trực tiếp.\n\n💡 Gợi ý tốt nhất: Bạn có thể dán trực tiếp link video YouTube (hoặc Drive) vào ô bên dưới để phát video chất lượng cao mà không bị giới hạn dung lượng!"
          )
        } else {
          alert(errorMsg)
        }
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      if (type === "video") {
        alert(
          err?.message ||
            "Không thể tải video lên máy chủ.\n\n💡 Bạn có thể dán link video YouTube (hoặc Google Drive, link MP4) vào ô bên dưới để phát video ngay lập tức!"
        )
      } else {
        alert(err?.message || "Không thể tải file lên. Hãy kiểm tra kết nối.")
      }
    } finally {
      if (type === "image") setUploadingImage(false)
      else setUploadingVideo(false)
    }
  }

  // Gỡ bỏ video
  const handleRemoveVideo = async () => {
    if (!editingEthnic) return
    if (!confirm(`Bạn có chắc chắn muốn gỡ video của dân tộc ${editingEthnic.name}?`)) return

    try {
      setFormData((prev) => ({ ...prev, videoUrl: "" }))
      await fetch(`/api/ethnic/${editingEthnic.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: "" }),
      }).catch(() => null)
      await fetch(`${BACKEND_URL}/api/ethnic/${editingEthnic.slug}/video`, {
        method: "DELETE",
      }).catch(() => null)
      setToastMessage(`Đã gỡ video của dân tộc ${editingEthnic.name}!`)
    } catch {
      setFormData((prev) => ({ ...prev, videoUrl: "" }))
    }
  }

  // Lưu thông tin dân tộc
  const handleSaveEthnic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEthnic) return
    setIsSaving(true)

    const cultures = cultureInput
      ? cultureInput
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : []

    const selectedRegions =
      formData.regions && formData.regions.length > 0
        ? formData.regions
        : formData.region
        ? [formData.region]
        : ["bac"]

    const payload = {
      ...formData,
      name: formData.name?.trim() || editingEthnic.name,
      culture: cultures,
      population:
        formData.population !== undefined && formData.population !== null && !isNaN(Number(formData.population))
          ? Number(formData.population)
          : 0,
      regions: selectedRegions,
      region: selectedRegions[0] || formData.region || "bac",
    }

    try {
      // 1. Ưu tiên cập nhật trực tiếp qua API nội bộ Next.js (lưu MongoDB Atlas)
      let res = await fetch(`/api/ethnic/${editingEthnic.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null)

      // 2. Dự phòng gọi backend NestJS nếu route nội bộ không phản hồi
      if (!res || !res.ok) {
        res = await fetch(`${BACKEND_URL}/api/ethnic/${editingEthnic.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null)
      } else {
        // Đồng bộ ngầm sang backend phụ nếu có
        fetch(`${BACKEND_URL}/api/ethnic/${editingEthnic.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {})
      }

      if (res && res.ok) {
        const result = await res.json()
        const updated = result.data || payload
        setEthnics((prev) =>
          prev.map((item) => (item.slug === editingEthnic.slug ? { ...item, ...updated } : item))
        )
        setToastMessage(`Đã lưu thay đổi cho dân tộc ${editingEthnic.name}!`)
        setEditingEthnic(null)
      } else {
        const errorData = res ? await res.json().catch(() => ({})) : {}
        alert(errorData.message || errorData.error || "Cập nhật không thành công.")
      }
    } catch (err) {
      console.error("Save error:", err)
      alert("Lỗi khi lưu thông tin. Hãy kiểm tra kết nối với backend.")
    } finally {
      setIsSaving(false)
    }
  }

  // --- Quản lý sản phẩm truyền thống trong Modal Dân tộc ---
  const handleOpenAddEthnicProduct = () => {
    setEditingEthnicProduct(null)
    setEthnicProductForm({
      name: "",
      category: "",
      image: "",
      origin: "",
      craft: "",
      culturalValue: "",
      description: "",
    })
    setEthnicProductFormOpen(true)
  }

  const handleOpenEditEthnicProduct = (prod: ProductItem) => {
    setEditingEthnicProduct(prod)
    setEthnicProductForm({
      name: prod.name,
      category: prod.category || "",
      image: prod.image || "",
      origin: prod.origin || "",
      craft: prod.craft || "",
      culturalValue: prod.culturalValue || "",
      description: prod.description || "",
    })
    setEthnicProductFormOpen(true)
  }

  const handleUploadEthnicProdImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    setUploadingEthnicProdImg(true)
    try {
      // Ưu tiên /api/upload của Next.js (lưu trực tiếp MongoDB Atlas, dùng URL relative)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }).catch(() => fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: formData }))

      const data = await res.json()
      if (res && res.ok && data.url) {
        const finalUrl = normalizeUploadUrl(data.url)
        setEthnicProductForm((prev) => ({ ...prev, image: finalUrl }))
        setToastMessage("Tải ảnh sản phẩm thành công! Bạn có thể nhấn 'Căn chỉnh ảnh' để điều chỉnh.")
      } else {
        alert(data?.error || data?.message || "Tải ảnh thất bại.")
      }
    } catch {
      alert("Không thể upload ảnh sản phẩm. Hãy kiểm tra kết nối.")
    } finally {
      setUploadingEthnicProdImg(false)
      e.target.value = ""
    }
  }

  const handleSaveEthnicProduct = async () => {
    if (!editingEthnic) return
    if (!ethnicProductForm.name.trim()) {
      alert("Vui lòng nhập tên sản phẩm truyền thống.")
      return
    }

    setSavingEthnicProd(true)
    try {
      const payload = {
        name: ethnicProductForm.name.trim(),
        category: ethnicProductForm.category.trim() || "Thủ công truyền thống",
        image: ethnicProductForm.image.trim() || "/placeholder.svg",
        ethnicSlug: editingEthnic.slug,
        origin: ethnicProductForm.origin.trim(),
        craft: ethnicProductForm.craft.trim(),
        culturalValue: ethnicProductForm.culturalValue.trim(),
        description: ethnicProductForm.description.trim(),
        price: 0,
        forSale: false,
        inStock: true,
      }

      if (editingEthnicProduct) {
        // Cập nhật sản phẩm
        const res = await fetch(`/api/products/${editingEthnicProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Không thể cập nhật sản phẩm.")
        setProducts((prev) =>
          prev.map((p) => (p.id === editingEthnicProduct.id ? { ...p, ...payload } : p))
        )
        setToastMessage(`Đã cập nhật thông tin sản phẩm "${payload.name}"!`)
      } else {
        // Tạo sản phẩm mới
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            id: slugify(payload.name || `sp-${Date.now()}`),
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Không thể tạo sản phẩm.")
        setProducts((prev) => [data.data, ...prev])
        setToastMessage(`Đã thêm sản phẩm "${payload.name}" cho dân tộc ${editingEthnic.name}!`)
      }

      setEthnicProductFormOpen(false)
      setEditingEthnicProduct(null)
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu sản phẩm.")
    } finally {
      setSavingEthnicProd(false)
    }
  }

  const handleDeleteEthnicProduct = async (prod: ProductItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${prod.name}" của dân tộc ${editingEthnic?.name}?`)) return
    try {
      const res = await fetch(`/api/products/${prod.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Không thể xóa sản phẩm.")
      }
      setProducts((prev) => prev.filter((p) => p.id !== prod.id))
      setToastMessage(`Đã xóa sản phẩm "${prod.name}" thành công!`)
    } catch (err: any) {
      alert(err.message || "Không thể xóa sản phẩm.")
    }
  }

  // Lọc danh sách sản phẩm
  const filteredProducts = products.filter((p) => {
    const q = productSearch.trim().toLowerCase()
    const matchQuery = !q || p.name.toLowerCase().includes(q) || (p.ethnicSlug && p.ethnicSlug.toLowerCase().includes(q))
    const matchEthnic = productEthnicFilter === "all" || p.ethnicSlug === productEthnicFilter
    let matchStatus = true
    if (productStatusFilter === "in_stock") matchStatus = Boolean(p.inStock)
    else if (productStatusFilter === "out_of_stock") matchStatus = !p.inStock

    return matchQuery && matchEthnic && matchStatus
  })

  // Phân trang sản phẩm
  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))
  const safeProductPage = Math.min(productCurrentPage, productTotalPages)
  const paginatedProducts = filteredProducts.slice(
    (safeProductPage - 1) * PRODUCTS_PER_PAGE,
    safeProductPage * PRODUCTS_PER_PAGE
  )

  // Lọc danh sách đơn hàng
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "all") return true
    return o.status === orderFilter
  })

  // Phân trang đơn hàng
  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE))
  const safeOrderPage = Math.min(orderCurrentPage, orderTotalPages)
  const paginatedOrders = filteredOrders.slice(
    (safeOrderPage - 1) * ORDERS_PER_PAGE,
    safeOrderPage * ORDERS_PER_PAGE
  )

  // Lọc danh sách dân tộc
  const filteredEthnics = ethnics.filter((e) => {
    const q = ethnicSearch.trim().toLowerCase()
    const matchQuery =
      !q ||
      e.name.toLowerCase().includes(q) ||
      (e.altNames && e.altNames.toLowerCase().includes(q))
    const ethnicRegions = e.regions && e.regions.length > 0 ? e.regions : [e.region]
    const matchRegion = regionFilter === "all" || ethnicRegions.includes(regionFilter)
    const matchVideo =
      videoFilter === "all" ||
      (videoFilter === "has_video" && Boolean(e.videoUrl)) ||
      (videoFilter === "no_video" && !e.videoUrl)
    return matchQuery && matchRegion && matchVideo
  })

  const countPendingOrders = orders.filter((o) => o.status === "pending").length

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <Check className="size-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                Bảng quản trị Hồn Y Đất Việt
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý danh sách đơn hàng thủ công và cập nhật tư liệu 54 dân tộc Việt Nam.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              <ExternalLink className="size-3.5" />
              Xem trang chủ
            </Link>
          </div>
        </div>

        {/* Quick Stats Bar (Chỉ đúng 3 ô theo yêu cầu) */}
        <div className="border-t border-border bg-muted/40 px-4 py-4">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Tổng số đơn hàng</p>
              <p className="mt-1 font-serif text-2xl font-bold text-foreground">{orders.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Đơn chờ xử lý</p>
              <p className="mt-1 font-serif text-2xl font-bold text-amber-600">{countPendingOrders}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Tổng số dân tộc</p>
              <p className="mt-1 font-serif text-2xl font-bold text-primary">{ethnics.length || 54}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto flex max-w-7xl gap-2 px-4 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="size-4" />
            Đơn đặt hàng ({orders.length})
            {countPendingOrders > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-700">
                {countPendingOrders} mới
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "products"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingCart className="size-4" />
            Sản phẩm ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ethnics")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "ethnics"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-4" />
            Quản lý 54 Dân tộc ({ethnics.length || 54})
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ============================================================== */}
        {/* TAB 1: ĐƠN ĐẶT HÀNG                                           */}
        {/* ============================================================== */}
        {activeTab === "orders" && (
          <div>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              {/* Filter by status */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "pending", label: "Chờ xử lý" },
                  { id: "confirmed", label: "Đã xác nhận" },
                  { id: "shipping", label: "Đang giao" },
                  { id: "completed", label: "Hoàn thành" },
                  { id: "cancelled", label: "Đã hủy" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setOrderFilter(st.id)
                      setOrderCurrentPage(1)
                    }}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      orderFilter === st.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground/80 hover:bg-muted"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loadingOrders}>
                <RefreshCw className={`mr-1.5 size-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                Làm mới danh sách
              </Button>
            </div>

            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p className="mt-3 text-sm">Đang tải danh sách đơn hàng...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <Package className="mx-auto size-12 text-muted-foreground/60" />
                <h3 className="mt-3 font-serif text-lg font-semibold text-foreground">
                  Chưa có đơn hàng nào
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {orderFilter === "all"
                    ? "Hiện tại hệ thống chưa ghi nhận đơn đặt hàng nào từ khách."
                    : "Không có đơn hàng nào ở trạng thái này."}
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  {paginatedOrders.map((order) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-amber-100 text-amber-800 border-amber-300",
                    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
                    shipping: "bg-indigo-100 text-indigo-800 border-indigo-300",
                    completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    cancelled: "bg-red-100 text-red-800 border-red-300",
                  }

                  const statusLabels: Record<string, string> = {
                    pending: "Chờ xử lý",
                    confirmed: "Đã xác nhận",
                    shipping: "Đang giao",
                    completed: "Hoàn thành",
                    cancelled: "Đã hủy",
                  }

                  return (
                    <div
                      key={order._id}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/40"
                    >
                      <div className="border-b border-border bg-muted/30 px-6 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-xs font-bold text-primary">
                              #{order._id.slice(-8).toUpperCase()}
                            </span>
                            {order.paymentCode && (
                              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-foreground font-semibold">
                                Code: {order.paymentCode}
                              </span>
                            )}
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                statusColors[order.status] || "bg-muted text-muted-foreground"
                              }`}
                            >
                              {statusLabels[order.status] || order.status}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                order.paymentStatus === "paid" || order.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border-amber-300"
                              }`}
                            >
                              {order.paymentStatus === "paid" || order.status === "completed"
                                ? "Đã thanh toán (SePay)"
                                : "Chưa thanh toán"}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3.5" />
                              {new Date(order.createdAt).toLocaleString("vi-VN")}
                            </span>
                          </div>


                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Đổi trạng thái:</span>
                            <select
                              value={order.status}
                              disabled={updatingOrderId === order._id || deletingOrderId === order._id}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="pending">Chờ xử lý</option>
                              <option value="confirmed">Đã xác nhận</option>
                              <option value="shipping">Đang giao</option>
                              <option value="completed">Hoàn thành</option>
                              <option value="cancelled">Đã hủy</option>
                            </select>

                            {order.status === "cancelled" && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setConfirmDeleteOrder(order)}
                                disabled={deletingOrderId === order._id}
                                className="h-7 px-2.5 text-xs gap-1 bg-red-600 hover:bg-red-700 text-white ml-1 shadow-sm"
                                title="Xóa vĩnh viễn đơn hàng đã hủy"
                              >
                                <Trash2 className="size-3.5" />
                                <span>Xóa đơn</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_1fr]">
                        {/* Customer & Address */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Thông tin người nhận
                          </h4>
                          <div className="space-y-1.5 text-sm">
                            <p className="font-semibold text-foreground">{order.customerName}</p>
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="size-3.5" /> {order.email}
                            </p>
                            {order.phone && (
                              <p className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="size-3.5" /> {order.phone}
                              </p>
                            )}
                            {order.address && (
                              <p className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="size-3.5 shrink-0" /> {order.address}
                              </p>
                            )}
                            {order.notes && (
                              <p className="rounded-lg bg-muted/60 p-2 text-xs italic text-muted-foreground">
                                Ghi chú: {order.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Order Items & Total */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Sản phẩm đặt mua ({order.items.reduce((s, i) => s + i.qty, 0)})
                          </h4>
                          <div className="mt-3 space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-2 text-sm"
                              >
                                <div className="flex items-center gap-3">
                                  {item.image && (
                                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border">
                                      <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-foreground line-clamp-1">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatVND(item.price)} × {item.qty}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-semibold text-foreground">
                                  {formatVND(item.price * item.qty)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 border-t border-border pt-3">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Phí vận chuyển:</span>
                              <span>{formatVND(order.shippingFee)}</span>
                            </div>
                            <div className="mt-1 flex justify-between font-serif text-base font-bold text-primary">
                              <span>Tổng tiền:</span>
                              <span>{formatVND(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Thanh phân trang Đơn hàng (chỉ hiện khi có nhiều đơn vượt quá 1 trang) */}
              {filteredOrders.length > ORDERS_PER_PAGE && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
                  <span className="text-muted-foreground">
                    Trang <strong className="text-foreground">{safeOrderPage}</strong> / {orderTotalPages} ({filteredOrders.length} đơn hàng, {ORDERS_PER_PAGE} đơn/trang)
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOrderCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={safeOrderPage <= 1}
                      className="h-8 gap-1 px-2.5"
                    >
                      <ChevronLeft className="size-3.5" />
                      Trước
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: orderTotalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setOrderCurrentPage(page)}
                          className={`size-8 rounded-md text-xs font-semibold transition-colors ${
                            page === safeOrderPage
                              ? "bg-primary text-primary-foreground font-bold shadow-sm"
                              : "border border-border bg-background text-foreground hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOrderCurrentPage((prev) => Math.min(orderTotalPages, prev + 1))}
                      disabled={safeOrderPage >= orderTotalPages}
                      className="h-8 gap-1 px-2.5"
                    >
                      Sau
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: QUẢN LÝ SẢN PHẨM BÁN HÀNG                                 */}
        {/* ============================================================== */}
        {activeTab === "products" && (
          <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
            <form onSubmit={handleCreateProduct} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Đăng sản phẩm</p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-foreground">Sản phẩm mới</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tên sản phẩm *</label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mô tả ngắn</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Giá bán *</label>
                  <Input
                    type="number"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Dân tộc *</label>
                    <div className="relative" ref={createEthnicDropdownRef}>
                      <Input
                        value={productForm.ethnicSlug}
                        onChange={(e) => {
                          setProductForm((prev) => ({ ...prev, ethnicSlug: e.target.value }))
                          setCreateEthnicOpen(true)
                        }}
                        onFocus={() => setCreateEthnicOpen(true)}
                        className="pr-8 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setCreateEthnicOpen((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        title="Bấm để chọn nhanh dân tộc hoặc tự nhập"
                      >
                        <ChevronDown className={`size-4 transition-transform duration-200 ${createEthnicOpen ? "rotate-180" : ""}`} />
                      </button>

                      {createEthnicOpen && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-xl">
                          {createEthnicSuggestions.length === 0 ? (
                            <div className="p-2 text-xs text-muted-foreground">
                              Không có gợi ý (vẫn dùng tên vừa nhập)
                            </div>
                          ) : (
                            createEthnicSuggestions.map((ethnic) => (
                              <button
                                key={ethnic.slug}
                                type="button"
                                onClick={() => {
                                  setProductForm((prev) => ({ ...prev, ethnicSlug: ethnic.name }))
                                  setCreateEthnicOpen(false)
                                }}
                                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                              >
                                <span className="font-medium">{ethnic.name}</span>
                                <span className="text-[10px] text-muted-foreground">Chọn</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Trạng thái</label>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setProductForm((prev) => ({ ...prev, inStock: true }))}
                        className={`rounded-md border px-3 py-2 text-xs font-semibold ${
                          productForm.inStock
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        Còn hàng
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductForm((prev) => ({ ...prev, inStock: false }))}
                        className={`rounded-md border px-3 py-2 text-xs font-semibold ${
                          !productForm.inStock
                            ? "border-red-500 bg-red-500/10 text-red-700"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        Hết hàng
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Ảnh sản phẩm</label>
                    {productForm.image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openCropper(
                            productForm.image,
                            `Căn chỉnh ảnh sản phẩm: ${productForm.name || "Mới"}`,
                            (newUrl) => setProductForm((prev) => ({ ...prev, image: newUrl })),
                            1
                          )
                        }
                        className="h-6 gap-1 px-2 text-[11px] font-medium text-primary hover:bg-primary/10"
                      >
                        <Crop className="size-3" />
                        Căn chỉnh ảnh
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                      {productForm.image ? (
                        <Image src={productForm.image} alt={productForm.name || "Product image"} fill className="object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <ImageIcon className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input type="file" accept="image/*" onChange={handleProductImageUpload} className="cursor-pointer text-xs" />
                      {productForm.image && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openCropper(
                              productForm.image,
                              `Căn chỉnh ảnh sản phẩm: ${productForm.name || "Mới"}`,
                              (newUrl) => setProductForm((prev) => ({ ...prev, image: newUrl })),
                              1
                            )
                          }
                          className="h-7 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                        >
                          <Crop className="size-3.5" />
                          Căn chỉnh / Cắt cúp ảnh này
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submittingProduct}>
                  {submittingProduct ? "Đang đăng..." : "Đăng sản phẩm lên cửa hàng"}
                </Button>
              </div>
            </form>

            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Cửa hàng</p>
                  <h3 className="mt-0.5 font-serif text-2xl font-bold text-foreground">Sản phẩm đang có</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Hiển thị <strong className="text-foreground">{filteredProducts.length}</strong> / {products.length} sản phẩm
                  </span>
                  <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loadingProducts}>
                    <RefreshCw className={`mr-1.5 size-3.5 ${loadingProducts ? "animate-spin" : ""}`} />
                    Làm mới
                  </Button>
                </div>
              </div>

              {/* Bộ lọc sản phẩm */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value)
                      setProductCurrentPage(1)
                    }}
                    className="h-9 pl-9 text-xs"
                  />
                </div>

                {/* Lọc theo Dân tộc */}
                <select
                  value={productEthnicFilter}
                  onChange={(e) => {
                    setProductEthnicFilter(e.target.value)
                    setProductCurrentPage(1)
                  }}
                  className="h-9 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Tất cả dân tộc</option>
                  {ethnicGroups.map((ethnic) => (
                    <option key={ethnic.slug} value={ethnic.slug}>
                      {ethnic.name}
                    </option>
                  ))}
                </select>

                {/* Lọc theo Trạng thái kho hàng */}
                <select
                  value={productStatusFilter}
                  onChange={(e) => {
                    setProductStatusFilter(e.target.value)
                    setProductCurrentPage(1)
                  }}
                  className="h-9 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Tất cả tình trạng kho</option>
                  <option value="in_stock">Còn hàng</option>
                  <option value="out_of_stock">Hết hàng</option>
                </select>

                {(productSearch || productEthnicFilter !== "all" || productStatusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setProductSearch("")
                      setProductEthnicFilter("all")
                      setProductStatusFilter("all")
                      setProductCurrentPage(1)
                    }}
                    className="h-9 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Xóa lọc
                  </Button>
                )}
              </div>

              {loadingProducts ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="size-8 animate-spin" />
                  <p className="mt-3 text-sm">Đang tải sản phẩm...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center">
                  <Package className="size-12 text-muted-foreground/60" />
                  <p className="mt-3 font-medium text-foreground">
                    {products.length === 0 ? "Chưa có sản phẩm nào" : "Không tìm thấy sản phẩm phù hợp"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {products.length === 0
                      ? "Thêm sản phẩm mới ở form bên trái."
                      : "Thử thay đổi từ khóa hoặc bộ lọc ở trên."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedProducts.map((product) => {
                    const ethnicInfo = ethnicGroups.find((g) => g.slug === product.ethnicSlug)

                    return (
                      <div
                        key={product.id}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-3.5 transition-colors hover:border-primary/30 sm:flex-row sm:items-center"
                      >
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground text-sm">{product.name}</p>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-medium text-primary">{product.category}</span>
                                <span>•</span>
                                <span>Dân tộc {ethnicInfo?.name || product.ethnicSlug}</span>
                              </div>
                            </div>

                            {/* Thao tác: Chỉnh sửa và Gỡ sản phẩm */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditProductModal(product)}
                                title="Chỉnh sửa sản phẩm"
                                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                              >
                                <Edit className="size-3" />
                                Chỉnh sửa
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmDeleteProduct(product)}
                                disabled={deletingProductId === product.id}
                                title="Gỡ vĩnh viễn sản phẩm"
                                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                              >
                                <Trash2 className="size-3" />
                                {deletingProductId === product.id ? "Đang gỡ..." : "Gỡ"}
                              </button>
                            </div>
                          </div>

                          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-primary">{formatVND(product.price)}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                product.inStock
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.inStock ? "Còn hàng" : "Hết hàng"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Thanh phân trang Pagination (chỉ hiện khi có nhiều sản phẩm vượt quá 1 trang) */}
              {filteredProducts.length > PRODUCTS_PER_PAGE && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
                  <span className="text-muted-foreground">
                    Trang <strong className="text-foreground">{safeProductPage}</strong> / {productTotalPages} ({filteredProducts.length} sản phẩm, 9 sản phẩm/trang)
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProductCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={safeProductPage <= 1}
                      className="h-8 gap-1 px-2.5"
                    >
                      <ChevronLeft className="size-3.5" />
                      Trước
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: productTotalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setProductCurrentPage(page)}
                          className={`size-8 rounded-md text-xs font-semibold transition-colors ${
                            page === safeProductPage
                              ? "bg-primary text-primary-foreground font-bold shadow-sm"
                              : "border border-border bg-background text-foreground hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProductCurrentPage((prev) => Math.min(productTotalPages, prev + 1))}
                      disabled={safeProductPage >= productTotalPages}
                      className="h-8 gap-1 px-2.5"
                    >
                      Sau
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: QUẢN LÝ 54 DÂN TỘC & MEDIA (ẢNH / VIDEO)               */}
        {/* ============================================================== */}
        {activeTab === "ethnics" && (
          <div>
            {/* Search & Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={ethnicSearch}
                    onChange={(e) => setEthnicSearch(e.target.value)}
                    placeholder="Tìm kiếm theo tên dân tộc..."
                    className="pl-9"
                  />
                </div>

                {/* Region Filter */}
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Tất cả miền</option>
                  <option value="bac">Miền Bắc</option>
                  <option value="trung">Miền Trung</option>
                  <option value="nam">Miền Nam</option>
                </select>

                {/* Video Filter */}
                <select
                  value={videoFilter}
                  onChange={(e) => setVideoFilter(e.target.value)}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Tất cả video</option>
                  <option value="has_video">Đã có video</option>
                  <option value="no_video">Chưa có video</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Hiển thị <strong className="text-foreground">{filteredEthnics.length}</strong> / 54 dân tộc
                </span>
                <Button variant="outline" size="sm" onClick={fetchEthnics} disabled={loadingEthnics}>
                  <RefreshCw className={`mr-1.5 size-3.5 ${loadingEthnics ? "animate-spin" : ""}`} />
                  Làm mới
                </Button>
              </div>
            </div>

            {loadingEthnics ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p className="mt-3 text-sm">Đang tải danh sách 54 dân tộc...</p>
              </div>
            ) : filteredEthnics.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <Users className="mx-auto size-12 text-muted-foreground/60" />
                <h3 className="mt-3 font-serif text-lg font-semibold text-foreground">
                  Không tìm thấy dân tộc nào
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thử tìm kiếm với từ khóa hoặc bộ lọc vùng miền khác.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEthnics.map((ethnic) => {
                  const regionBadge: Record<string, string> = {
                    bac: "Miền Bắc",
                    trung: "Miền Trung",
                    nam: "Miền Nam",
                  }

                  return (
                    <div
                      key={ethnic.slug}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                          <Image
                            src={
                              brokenImgSlugs[ethnic.slug]
                                ? (ethnicGroups.find((g) => g.slug === ethnic.slug)?.image || "/images/ethnic-kinh.png")
                                : (ethnic.image || ethnicGroups.find((g) => g.slug === ethnic.slug)?.image || "/placeholder.svg")
                            }
                            alt={ethnic.name}
                            fill
                            sizes="80px"
                            className="object-cover transition-transform group-hover:scale-105"
                            onError={() => setBrokenImgSlugs((prev) => ({ ...prev, [ethnic.slug]: true }))}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-serif text-base font-bold text-foreground">
                              {ethnic.name}
                            </h3>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {ethnic.regions && ethnic.regions.length === 3
                                ? "Cả 3 miền"
                                : ethnic.regions && ethnic.regions.length > 0
                                ? ethnic.regions.map((r) => regionBadge[r] || r).join(", ")
                                : regionBadge[ethnic.region] || ethnic.region}
                            </span>
                          </div>
                          {ethnic.altNames && (
                            <p className="text-xs text-muted-foreground">Còn gọi: {ethnic.altNames}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            Dân số: <span className="font-medium text-foreground">{ethnic.population.toLocaleString("vi-VN")}</span>
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {ethnic.videoUrl ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                <Film className="size-3" />
                                Có video
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                Chưa có video
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <Link
                          href={`/dan-toc/${ethnic.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="size-3" />
                          Xem trang
                        </Link>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(ethnic)}
                          className="h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Edit className="size-3.5" />
                          Chỉnh sửa
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: CHỈNH SỬA THÔNG TIN, THAY ẢNH & QUẢN LÝ VIDEO           */}
      {/* ============================================================== */}
      {editingEthnic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setEditingEthnic(null)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-border pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Cập nhật thông tin dân tộc
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
                Dân tộc {editingEthnic.name}
              </h2>
            </div>

            <form onSubmit={handleSaveEthnic} className="mt-6 space-y-6">
              {/* Row 1: Tên & Tên gọi khác */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tên dân tộc</label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tên gọi khác</label>
                  <Input
                    value={formData.altNames || ""}
                    onChange={(e) => setFormData({ ...formData, altNames: e.target.value })}
                  />
                </div>
              </div>

              {/* Vùng miền: Có thể chọn 1, 2 hoặc cả 3 vùng */}
              <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Vùng miền (có thể chọn 1, 2 hoặc cả 3 vùng)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const current = formData.regions || (formData.region ? [formData.region] : [])
                      if (current.length === 3) {
                        setFormData({ ...formData, regions: ["bac"], region: "bac" })
                      } else {
                        setFormData({
                          ...formData,
                          regions: ["bac", "trung", "nam"],
                          region: "bac",
                        })
                      }
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {(formData.regions || []).length === 3 ? "Bỏ chọn tất cả" : "Chọn cả 3 vùng"}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "bac" as const, label: "Miền Bắc" },
                    { id: "trung" as const, label: "Miền Trung" },
                    { id: "nam" as const, label: "Miền Nam" },
                  ].map((r) => {
                    const isSelected = (formData.regions || []).includes(r.id)
                    return (
                      <label
                        key={r.id}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border py-2 px-3 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const current =
                              formData.regions && formData.regions.length > 0
                                ? formData.regions
                                : formData.region
                                ? [formData.region]
                                : []
                            let updated: ("bac" | "trung" | "nam" | string)[]
                            if (e.target.checked) {
                              updated = Array.from(new Set([...current, r.id]))
                            } else {
                              updated = current.filter((x) => x !== r.id)
                            }
                            setFormData({
                              ...formData,
                              regions: updated,
                              region: updated[0] || "bac",
                            })
                          }}
                          className="size-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span>{r.label}</span>
                      </label>
                    )
                  })}
                </div>

                {(formData.regions || []).length === 3 && (
                  <p className="text-[11px] font-medium text-emerald-600">
                    ✓ Đã chọn cả 3 miền (Toàn quốc)
                  </p>
                )}

                {/* Ô chỉnh sửa chi tiết vùng cư trú */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-foreground">
                    Địa bàn / Vùng cư trú chi tiết
                  </label>
                  <Input
                    value={formData.residenceArea || ""}
                    onChange={(e) => setFormData({ ...formData, residenceArea: e.target.value })}
                    placeholder="Ví dụ: Miền núi phía Bắc (Cao Bằng, Lạng Sơn, Tuyên Quang...) hoặc Toàn quốc"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Nếu để trống, hệ thống sẽ tự động hiển thị theo các vùng miền đã chọn ở trên.
                  </p>
                </div>
              </div>

              {/* Dân số & Ngữ hệ */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Dân số</label>
                  <Input
                    type="number"
                    value={formData.population ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        population: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Nhóm ngôn ngữ</label>
                  <Input
                    value={formData.languageFamily || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, languageFamily: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Tóm tắt & Nội dung chi tiết */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tóm tắt ngắn (Blurb)</label>
                <textarea
                  value={formData.blurb || ""}
                  onChange={(e) => setFormData({ ...formData, blurb: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Giới thiệu chi tiết</label>
                <textarea
                  value={formData.detail || ""}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Nét văn hóa */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nét văn hóa đặc trưng (cách nhau bằng dấu phẩy)
                </label>
                <Input
                  value={cultureInput}
                  onChange={(e) => setCultureInput(e.target.value)}
                  placeholder="Ví dụ: Áo dài, Hát Then, Đàn tính, Lễ hội Lồng Tồng"
                />
              </div>

              {/* ==================================================== */}
              {/* PHẦN 1: QUẢN LÝ ẢNH ĐẠI DIỆN                        */}
              {/* ==================================================== */}
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    <ImageIcon className="size-4 text-primary" />
                    Ảnh đại diện dân tộc
                  </h4>
                  {formData.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openCropper(
                          formData.image,
                          `Căn chỉnh ảnh đại diện - Dân tộc ${formData.name || ""}`,
                          (newUrl) => setFormData((prev) => ({ ...prev, image: newUrl })),
                          4 / 3
                        )
                      }
                      className="h-6 gap-1 px-2 text-[11px] font-medium text-primary hover:bg-primary/10"
                    >
                      <Crop className="size-3" />
                      Căn chỉnh ảnh
                    </Button>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {/* Image preview */}
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                    <Image
                      src={
                        formData.image ||
                        ethnicGroups.find((g) => g.slug === formData.slug)?.image ||
                        "/images/ethnic-kinh.png"
                      }
                      alt="Ảnh dân tộc"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "image")
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingImage}
                        onClick={() => imageInputRef.current?.click()}
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            Đang tải ảnh...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-1.5 size-3.5" />
                            Tải ảnh mới từ máy tính
                          </>
                        )}
                      </Button>
                      {formData.image && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openCropper(
                              formData.image,
                              `Căn chỉnh ảnh đại diện - Dân tộc ${formData.name || ""}`,
                              (newUrl) => setFormData((prev) => ({ ...prev, image: newUrl })),
                              4 / 3
                            )
                          }
                          className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                        >
                          <Crop className="size-3.5" />
                          Căn chỉnh ảnh này
                        </Button>
                      )}
                    </div>

                    <Input
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Hoặc dán URL ảnh trực tiếp (/images/... hoặc https://...)"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* ==================================================== */}
              {/* PHẦN 2: QUẢN LÝ VIDEO (GỠ HOẶC TẢI VIDEO MỚI LÊN)    */}
              {/* ==================================================== */}
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    <Video className="size-4 text-primary" />
                    Tư liệu Video văn hóa
                  </h4>

                  {formData.videoUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveVideo}
                      className="h-7 text-xs"
                    >
                      <Trash2 className="mr-1 size-3" />
                      Gỡ video hiện tại
                    </Button>
                  )}
                </div>

                {formData.videoUrl ? (
                  <div className="mt-3 space-y-2">
                    {/* Video preview */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                      {(() => {
                        const embed = parseVideoEmbedUrl(formData.videoUrl)
                        if (!embed) {
                          return (
                            <div className="grid size-full place-items-center text-xs text-muted-foreground">
                              Đường link video không hợp lệ
                            </div>
                          )
                        }
                        if (embed.type === "youtube" || embed.type === "drive") {
                          return (
                            <iframe
                              src={embed.src}
                              title="Xem thử video"
                              className="size-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )
                        }
                        return (
                          <video
                            controls
                            src={embed.src}
                            className="size-full object-cover"
                            playsInline
                          >
                            Trình duyệt không hỗ trợ phát video này.
                          </video>
                        )
                      })()}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground line-clamp-1">
                      Link: {formData.videoUrl}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center">
                    <Film className="mx-auto size-8 text-muted-foreground/60" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Dân tộc này chưa có video tư liệu. Bạn có thể tải video từ máy tính hoặc dán link YouTube/Drive.
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-2.5">
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "video")
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingVideo}
                      onClick={() => videoInputRef.current?.click()}
                    >
                      {uploadingVideo ? (
                        <>
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                          Đang tải video lên máy chủ...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-1.5 size-3.5" />
                          Tải video từ máy tính (MP4 / WebM)
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">hoặc</span>
                  </div>

                  <div className="space-y-1">
                    <Input
                      value={formData.videoUrl || ""}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="Dán link YouTube (https://youtu.be/...), Google Drive hoặc link file (.mp4)"
                      className="text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      💡 <strong>Khuyên dùng:</strong> Dán link YouTube (phim tài liệu VTV5, video văn hóa,...) để phát độ nét cao mượt mà không bị giới hạn dung lượng lưu trữ.
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================================================== */}
              {/* PHẦN 3: SẢN PHẨM TRUYỀN THỐNG & DI SẢN THỦ CÔNG       */}
              {/* ==================================================== */}
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h4 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      <ShoppingBag className="size-4 text-primary" />
                      Sản phẩm truyền thống &amp; Di sản thủ công
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Các sản phẩm đặc trưng của dân tộc {editingEthnic.name} (hiển thị trên trang chi tiết dân tộc)
                    </p>
                  </div>

                  {!ethnicProductFormOpen && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenAddEthnicProduct}
                      className="h-8 gap-1.5 border-primary/30 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Plus className="size-3.5" />
                      Thêm sản phẩm truyền thống
                    </Button>
                  )}
                </div>

                {/* Form thêm / sửa sản phẩm truyền thống inline */}
                {ethnicProductFormOpen && (
                  <div className="mt-4 rounded-xl border border-primary/30 bg-card p-4 shadow-sm animate-in fade-in-50">
                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-md bg-primary/10 text-primary">
                          <Sparkles className="size-3.5" />
                        </span>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-primary">
                          {editingEthnicProduct
                            ? `Chỉnh sửa: ${editingEthnicProduct.name}`
                            : "Thêm sản phẩm truyền thống mới"}
                        </h5>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEthnicProductFormOpen(false)
                          setEditingEthnicProduct(null)
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-4">
                      {/* Tên & Phân loại (cho nhập tự do) */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">
                            Tên sản phẩm truyền thống <span className="text-destructive">*</span>
                          </label>
                          <Input
                            value={ethnicProductForm.name}
                            onChange={(e) =>
                              setEthnicProductForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Ví dụ: Khăn piêu thêu tay, Khèn Mông, Đàn tính, Gốm Bàu Trúc..."
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">
                            Phân loại sản phẩm (nhập tự do) <span className="text-destructive">*</span>
                          </label>
                          <div className="space-y-1.5">
                            <Input
                              value={ethnicProductForm.category}
                              onChange={(e) =>
                                setEthnicProductForm((prev) => ({ ...prev, category: e.target.value }))
                              }
                              placeholder="Nhập loại: Thổ cẩm, Nhạc cụ, Trang phục, Gốm sứ, Đan lát..."
                              className="h-8 text-xs"
                              list="craft-categories"
                            />
                            <datalist id="craft-categories">
                              <option value="Thổ cẩm" />
                              <option value="Nhạc cụ" />
                              <option value="Trang phục" />
                              <option value="Gốm sứ" />
                              <option value="Thủ công mỹ nghệ" />
                              <option value="Nghề đan lát" />
                              <option value="Đặc sản truyền thống" />
                              <option value="Trang sức dân tộc" />
                              <option value="Nông cụ truyền thống" />
                            </datalist>
                            {/* Gợi ý chọn nhanh */}
                            <div className="flex flex-wrap gap-1">
                              {["Thổ cẩm", "Nhạc cụ", "Trang phục", "Gốm sứ", "Đồ thủ công", "Đan lát", "Đặc sản", "Trang sức"].map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setEthnicProductForm((prev) => ({ ...prev, category: cat }))}
                                  className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                                    ethnicProductForm.category === cat
                                      ? "bg-primary text-primary-foreground font-semibold"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ảnh minh họa sản phẩm */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground">Hình ảnh minh họa sản phẩm</label>
                          {ethnicProductForm.image && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openCropper(
                                  ethnicProductForm.image,
                                  `Căn chỉnh ảnh: ${ethnicProductForm.name || "Sản phẩm truyền thống"}`,
                                  (newUrl) => setEthnicProductForm((prev) => ({ ...prev, image: newUrl })),
                                  1
                                )
                              }
                              className="h-6 gap-1 px-2 text-[11px] font-medium text-primary hover:bg-primary/10"
                            >
                              <Crop className="size-3" />
                              Căn chỉnh ảnh
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            <Image
                              src={ethnicProductForm.image || "/placeholder.svg"}
                              alt="Ảnh sản phẩm"
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <input
                              type="file"
                              ref={ethnicProdImageInputRef}
                              accept="image/*"
                              className="hidden"
                              onChange={handleUploadEthnicProdImg}
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={uploadingEthnicProdImg}
                                onClick={() => ethnicProdImageInputRef.current?.click()}
                                className="h-7 text-xs"
                              >
                                {uploadingEthnicProdImg ? (
                                  <>
                                    <Loader2 className="mr-1 size-3 animate-spin" />
                                    Đang tải ảnh...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-1 size-3" />
                                    Tải ảnh từ máy tính
                                  </>
                                )}
                              </Button>
                              {ethnicProductForm.image && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openCropper(
                                      ethnicProductForm.image,
                                      `Căn chỉnh ảnh: ${ethnicProductForm.name || "Sản phẩm truyền thống"}`,
                                      (newUrl) => setEthnicProductForm((prev) => ({ ...prev, image: newUrl })),
                                      1
                                    )
                                  }
                                  className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                                >
                                  <Crop className="size-3" />
                                  Căn chỉnh ảnh
                                </Button>
                              )}
                            </div>
                            <Input
                              value={ethnicProductForm.image}
                              onChange={(e) =>
                                setEthnicProductForm((prev) => ({ ...prev, image: e.target.value }))
                              }
                              placeholder="Hoặc dán URL ảnh (/images/... hoặc https://...)"
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Nguồn gốc & Xuất xứ */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground">
                          Nguồn gốc &amp; Địa bàn xuất xứ
                        </label>
                        <Input
                          value={ethnicProductForm.origin}
                          onChange={(e) =>
                            setEthnicProductForm((prev) => ({ ...prev, origin: e.target.value }))
                          }
                          placeholder="Ví dụ: Các bản làng H'Mông vùng núi phía Bắc (Hà Giang, Lào Cai, Lai Châu...)"
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Chất liệu & Kỹ thuật chế tác */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground">
                          Chất liệu &amp; Kỹ thuật chế tác thủ công
                        </label>
                        <textarea
                          value={ethnicProductForm.craft}
                          onChange={(e) =>
                            setEthnicProductForm((prev) => ({ ...prev, craft: e.target.value }))
                          }
                          rows={2}
                          placeholder="Ví dụ: Vải lanh dệt thủ công trên khung cửi cổ truyền, nhuộm chàm tự nhiên và thêu tay tỉ mỉ bằng sáp ong..."
                          className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {/* Giá trị văn hóa & Đời sống */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground">
                          Giá trị văn hóa &amp; Ý nghĩa đời sống
                        </label>
                        <textarea
                          value={ethnicProductForm.culturalValue}
                          onChange={(e) =>
                            setEthnicProductForm((prev) => ({ ...prev, culturalValue: e.target.value }))
                          }
                          rows={2}
                          placeholder="Ví dụ: Là biểu tượng nhận diện văn hóa dân tộc, gắn liền với lễ hội mùa xuân, phong tục cưới hỏi và truyền thống..."
                          className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {/* Giới thiệu chi tiết (để người đọc tìm hiểu) */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground">
                          Nội dung giới thiệu chi tiết (để người đọc tìm hiểu)
                        </label>
                        <textarea
                          value={ethnicProductForm.description}
                          onChange={(e) =>
                            setEthnicProductForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                          rows={3}
                          placeholder="Bài viết thông tin chi tiết về sản phẩm, lịch sử hình thành, quy trình làm ra sản phẩm..."
                          className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {/* Nút lưu sản phẩm */}
                      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEthnicProductFormOpen(false)
                            setEditingEthnicProduct(null)
                          }}
                          className="h-8 text-xs"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={savingEthnicProd}
                          onClick={handleSaveEthnicProduct}
                          className="h-8 gap-1.5 bg-primary text-xs text-primary-foreground"
                        >
                          {savingEthnicProd ? (
                            <>
                              <Loader2 className="size-3 animate-spin" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Check className="size-3" />
                              {editingEthnicProduct ? "Cập nhật thông tin" : "Lưu thông tin sản phẩm"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Danh sách các sản phẩm truyền thống hiện có (chỉ để đọc và giới thiệu) */}
                {(() => {
                  const dbMatches = products.filter((p) => p.ethnicSlug === editingEthnic.slug)
                  const staticMatches = defaultEthnicProducts.filter((p) => p.ethnicSlug === editingEthnic.slug)
                  const currentList = dbMatches.length > 0 ? dbMatches : staticMatches

                  if (currentList.length === 0) {
                    return (
                      <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center">
                        <ShoppingBag className="mx-auto size-8 text-muted-foreground/60" />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Dân tộc này chưa có thông tin sản phẩm truyền thống nào. Bạn có thể bấm &quot;Thêm sản phẩm truyền thống&quot; ở trên để đăng bài giới thiệu.
                        </p>
                      </div>
                    )
                  }

                  return (
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {currentList.map((p) => (
                        <div
                          key={p.id}
                          className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                        >
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            <Image
                              src={p.image || "/placeholder.svg"}
                              alt={p.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="truncate font-bold text-xs text-foreground" title={p.name}>
                                {p.name}
                              </h5>
                              <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                {p.category}
                              </span>
                            </div>

                            {p.origin && (
                              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <MapPin className="size-3 shrink-0 text-primary" />
                                <span className="truncate">{p.origin}</span>
                              </p>
                            )}

                            {p.craft && (
                              <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                                <span className="font-medium text-foreground">Kỹ thuật:</span> {p.craft}
                              </p>
                            )}

                            {p.culturalValue && (
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                                <span className="font-medium text-foreground">Ý nghĩa:</span> {p.culturalValue}
                              </p>
                            )}

                            {p.description && !p.craft && !p.culturalValue && (
                              <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                                {p.description}
                              </p>
                            )}

                            <div className="mt-2.5 flex items-center justify-end gap-1.5 border-t border-border/50 pt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleOpenEditEthnicProduct({
                                    id: p.id,
                                    name: p.name,
                                    price: 0,
                                    image: p.image || "/placeholder.svg",
                                    ethnicSlug: p.ethnicSlug,
                                    category: p.category || "Thủ công",
                                    description: p.description || "",
                                    origin: p.origin || "",
                                    craft: p.craft || "",
                                    culturalValue: p.culturalValue || "",
                                    forSale: false,
                                    inStock: true,
                                  })
                                }
                                className="h-6 gap-1 px-2 text-[10px] font-medium text-primary hover:bg-primary/10"
                              >
                                <Edit className="size-2.5" />
                                Chỉnh sửa thông tin
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteEthnicProduct({
                                    id: p.id,
                                    name: p.name,
                                    price: 0,
                                    image: p.image || "/placeholder.svg",
                                    ethnicSlug: p.ethnicSlug,
                                    category: p.category || "Thủ công",
                                    forSale: false,
                                    inStock: true,
                                  })
                                }
                                className="h-6 gap-1 px-2 text-[10px] font-medium text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="size-2.5" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingEthnic(null)}
                  disabled={isSaving}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                      Đang lưu thay đổi...
                    </>
                  ) : (
                    <>
                      <Check className="mr-1.5 size-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CHỈNH SỬA SẢN PHẨM ĐÃ ĐĂNG                              */}
      {/* ============================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-border pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Cập nhật thông tin
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
                Chỉnh sửa sản phẩm
              </h2>
            </div>

            <form onSubmit={handleUpdateProduct} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tên sản phẩm *</label>
                <Input
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Mô tả ngắn</label>
                <textarea
                  value={editProductForm.description}
                  onChange={(e) => setEditProductForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Giá bán (VNĐ) *</label>
                <Input
                  type="number"
                  min="0"
                  value={editProductForm.price}
                  onChange={(e) => setEditProductForm((prev) => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Dân tộc *</label>
                  <div className="relative" ref={editEthnicDropdownRef}>
                    <Input
                      value={editProductForm.ethnicSlug}
                      onChange={(e) => {
                        setEditProductForm((prev) => ({ ...prev, ethnicSlug: e.target.value }))
                        setEditEthnicOpen(true)
                      }}
                      onFocus={() => setEditEthnicOpen(true)}
                      required
                      className="pr-8 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setEditEthnicOpen((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                      title="Bấm để chọn nhanh dân tộc hoặc tự nhập"
                    >
                      <ChevronDown className={`size-4 transition-transform duration-200 ${editEthnicOpen ? "rotate-180" : ""}`} />
                    </button>

                    {editEthnicOpen && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-xl">
                        {editEthnicSuggestions.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground">
                            Không có gợi ý (vẫn dùng tên vừa nhập)
                          </div>
                        ) : (
                          editEthnicSuggestions.map((ethnic) => (
                            <button
                              key={ethnic.slug}
                              type="button"
                              onClick={() => {
                                setEditProductForm((prev) => ({ ...prev, ethnicSlug: ethnic.name }))
                                setEditEthnicOpen(false)
                              }}
                              className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                            >
                              <span className="font-medium">{ethnic.name}</span>
                              <span className="text-[10px] text-muted-foreground">Chọn</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tình trạng kho *</label>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditProductForm((prev) => ({ ...prev, inStock: true }))}
                      className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                        editProductForm.inStock
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      Còn hàng
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditProductForm((prev) => ({ ...prev, inStock: false }))}
                      className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                        !editProductForm.inStock
                          ? "border-red-500 bg-red-500/10 text-red-700"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      Hết hàng
                    </button>
                  </div>
                </div>
              </div>

              {/* Ảnh sản phẩm */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Ảnh sản phẩm *</label>
                  {editProductForm.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openCropper(
                          editProductForm.image,
                          `Căn chỉnh ảnh sản phẩm: ${editProductForm.name || ""}`,
                          (newUrl) => setEditProductForm((prev) => ({ ...prev, image: newUrl })),
                          1
                        )
                      }
                      className="h-6 gap-1 px-2 text-[11px] font-medium text-primary hover:bg-primary/10"
                    >
                      <Crop className="size-3" />
                      Căn chỉnh ảnh
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                    {editProductForm.image ? (
                      <Image
                        src={editProductForm.image}
                        alt={editProductForm.name || "Product image"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground">
                        <ImageIcon className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={editProductImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditProductImageUpload}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingEditProductImage}
                        onClick={() => editProductImageInputRef.current?.click()}
                      >
                        {uploadingEditProductImage ? (
                          <>
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            Đang tải ảnh lên...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-1.5 size-3.5" />
                            Chọn ảnh mới từ máy tính
                          </>
                        )}
                      </Button>
                      {editProductForm.image && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openCropper(
                              editProductForm.image,
                              `Căn chỉnh ảnh sản phẩm: ${editProductForm.name || ""}`,
                              (newUrl) => setEditProductForm((prev) => ({ ...prev, image: newUrl })),
                              1
                            )
                          }
                          className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                        >
                          <Crop className="size-3.5" />
                          Căn chỉnh ảnh này
                        </Button>
                      )}
                    </div>
                    <Input
                      value={editProductForm.image}
                      onChange={(e) => setEditProductForm((prev) => ({ ...prev, image: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  disabled={isUpdatingProduct}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingProduct}
                  className="bg-primary text-primary-foreground"
                >
                  {isUpdatingProduct ? (
                    <>
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check className="mr-1.5 size-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP: XÁC NHẬN GỠ VĨNH VIỄN SẢN PHẨM                          */}
      {/* ============================================================== */}
      {confirmDeleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Xác nhận gỡ sản phẩm
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Bạn có chắc chắn muốn gỡ vĩnh viễn sản phẩm{" "}
                  <strong className="text-foreground">"{confirmDeleteProduct.name}"</strong> khỏi cửa hàng không?
                </p>
                <p className="mt-1 text-xs text-red-500 font-medium">
                  Hành động này sẽ xóa dữ liệu và không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDeleteProduct(null)}
                disabled={Boolean(deletingProductId)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(deletingProductId)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deletingProductId ? (
                  <>
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                    Đang gỡ...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-1.5 size-4" />
                    Gỡ sản phẩm
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP: XÁC NHẬN XÓA VĨNH VIỄN ĐƠN HÀNG ĐÃ HỦY                  */}
      {/* ============================================================== */}
      {confirmDeleteOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Xác nhận xóa đơn hàng
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng{" "}
                  <strong className="text-foreground">
                    #{confirmDeleteOrder._id.slice(-8).toUpperCase()}
                  </strong>{" "}
                  của <strong className="text-foreground">{confirmDeleteOrder.customerName}</strong> ({formatVND(confirmDeleteOrder.total)}) khỏi hệ thống không?
                </p>
                <p className="mt-1 text-xs text-red-500 font-medium">
                  Đơn hàng này đang ở trạng thái đã hủy. Hành động này sẽ xóa dữ liệu và không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDeleteOrder(null)}
                disabled={Boolean(deletingOrderId)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDeleteOrder}
                disabled={Boolean(deletingOrderId)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deletingOrderId ? (
                  <>
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-1.5 size-4" />
                    Xóa vĩnh viễn
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Căn chỉnh & Cắt cúp ảnh trực quan */}
      <ImageCropperModal
        isOpen={cropperModal.isOpen}
        imageUrl={cropperModal.imageUrl}
        title={cropperModal.title}
        aspectRatio={cropperModal.aspectRatio || 1}
        backendUrl={BACKEND_URL}
        onClose={() => setCropperModal((prev) => ({ ...prev, isOpen: false }))}
        onApply={(newImageUrl) => {
          cropperModal.onApply(newImageUrl)
          setToastMessage("Áp dụng căn chỉnh ảnh thành công!")
        }}
      />
    </div>
  )
}
