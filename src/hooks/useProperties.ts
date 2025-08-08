// ============================================================================
// 매물 관리 커스텀 훅
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getProperties, getPropertyStats, createProperty, updateProperty, deleteProperty } from '@/services'
import type { Property, SimplePropertyFilters, CreatePropertyData, UpdatePropertyData } from '@/types'

export const useProperties = (filters?: SimplePropertyFilters) => {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      setError(null)
      setProperties([])
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // 사용자 ID를 tenant_id로 사용하여 개별 데이터 조회
      const data = await getProperties(user.id, filters)
      setProperties((data as Property[]) || [])
    } catch (err) {
      console.error('❌ 데이터 로딩 실패:', err)
      setError('매물을 불러오는 중 오류가 발생했습니다.')
      // 에러 발생시 빈 배열로 설정
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, filters])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const createNewProperty = useCallback(async (propertyData: CreatePropertyData) => {
    
    if (!user?.id) {
      throw new Error('사용자 인증 정보가 없습니다. 다시 로그인 해주세요.')
    }

    try {
      const newProperty = await createProperty(propertyData, user.id, user.id)
      
      setProperties(prev => [newProperty, ...prev])
      return newProperty
    } catch (err) {
      console.error('❌ useProperties.createNewProperty 실패:', err)
      console.error('❌ 에러 타입:', typeof err)
      console.error('❌ 에러 상세:', err instanceof Error ? {
        name: err.name,
        message: err.message,
        stack: err.stack
      } : err)
      
      // 더 구체적인 에러 메시지 제공
      if (err instanceof Error) {
        throw err // 원본 에러 메시지 사용
      } else {
        throw new Error('매물 생성 중 알 수 없는 오류가 발생했습니다.')
      }
    }
  }, [user?.id])

  const updateExistingProperty = useCallback(async (propertyId: string, propertyData: UpdatePropertyData) => {
    if (!user?.id) {
      throw new Error('사용자 정보가 없습니다.')
    }

    try {
      const updatedProperty = await updateProperty(propertyId, propertyData, user.id)
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? updatedProperty : p).filter((p): p is Property => p !== null)
      )
      return updatedProperty
    } catch (err) {
      console.error('Error updating property:', err)
      throw new Error('매물 수정 중 오류가 발생했습니다.')
    }
  }, [user?.id])

  const deleteExistingProperty = useCallback(async (propertyId: string) => {
    if (!user?.id) {
      throw new Error('사용자 정보가 없습니다.')
    }

    try {
      await deleteProperty(propertyId, user.id)
      setProperties(prev => prev.filter(p => p.id !== propertyId))
    } catch (err) {
      console.error('Error deleting property:', err)
      throw new Error('매물 삭제 중 오류가 발생했습니다.')
    }
  }, [user?.id])

  // 매물 상태 업데이트 기능 삭제됨

  return {
    properties,
    loading,
    error,
    refreshProperties: fetchProperties,
    createProperty: createNewProperty,
    updateProperty: updateExistingProperty,
    deleteProperty: deleteExistingProperty,
    // updatePropertyStatus: 매물 상태 업데이트 기능 삭제됨
  }
}

export const usePropertyStats = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await getPropertyStats(user.id)
        setStats(data)
      } catch (err) {
        console.error('Error fetching property stats:', err)
        setError('통계를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?.id])

  return { stats, loading, error }
}